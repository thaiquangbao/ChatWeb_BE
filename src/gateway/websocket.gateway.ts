import { Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { IRoomsService } from 'src/room/room';
import { Services } from 'src/untills/constain';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IMessageService } from 'src/messages/messages';
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
})
export class MessagingGateway implements OnGatewayConnection {
  constructor(
    @Inject(Services.MESSAGES)
    private readonly messagesService: IMessageService,
    @Inject(Services.ROOMS)
    private readonly roomsService: IRoomsService,
    private readonly events: EventEmitter2,
  ) {}
  handleConnection(client: any, ...args: any[]) {
    //console.log(client.id);
    client.emit('connected', { status: 'good' });
    //console.log(client);
  }

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('createMessage')
  handleCreateMessage(@MessageBody() data: any) {
    console.log('createdMessages');
  }
  @OnEvent('messages.create')
  async handleMessagesCreateEvent(payload: any) {
    //console.log('Đã vào được chức năng tạo messages');
    this.server.emit(payload.rooms._id, await payload);
  }
  @OnEvent('rooms.create')
  handleRoomsCreateEvent(payload: any) {
    //console.log('Đã vào được chức năng tạo messages');
    this.server.emit(payload.creator.email, payload);
    if (payload.creator.email !== payload.recipient.email) {
      return this.server.emit(payload.recipient.email, payload);
    }
  }
  @OnEvent('rooms.get')
  handleRoomsGetEvent(payload: any) {
    // console.log('Đã vào được chức năng get Phòng');
    this.server.emit('getRooms', payload);
  }
  @OnEvent('messages.create')
  async handleMessagesUpdateEvent(payload: any) {
    if (payload.message.author.email === payload.rooms.creator.email) {
      return this.server.emit(
        payload.message.rooms.recipient.email,
        await payload,
      );
    } else {
      return this.server.emit(
        payload.message.rooms.creator.email,
        await payload,
      );
    }
  }
  @SubscribeMessage('onRoomJoin')
  async onJoinRooms(@MessageBody() data: any, @ConnectedSocket() client: any) {
    console.log('Đã tham gia phòng');
    client.join(data.roomsId);
    console.log(client.session);
    client.to(data.roomsId).emit('userJoin');
  }
  @SubscribeMessage('onRoomLeave')
  async onLeaveRooms(@MessageBody() data: any, @ConnectedSocket() client: any) {
    console.log('Đã rời tham gia phòng');
    client.join(data.roomsId);
    console.log(client.session);
    client.to(data.roomsId).emit('userLeave');
  }
  @SubscribeMessage('onUserTyping')
  async handleUserTyping(
    @MessageBody() data: any,
    @ConnectedSocket() client: any,
  ) {
    const result = await this.roomsService.findById(data.roomsId);
    if (result.creator.phoneNumber === data.phoneNumber) {
      return this.server
        .to(data.roomsId)
        .emit(`${result.recipient.phoneNumber}${data.roomsId}`);
    }
    if (data.phoneNumber === result.recipient.phoneNumber) {
      this.server
        .to(data.roomsId)
        .emit(`${result.creator.phoneNumber}${data.roomsId}`);
    }
  }
  @OnEvent('messages.deleted')
  async handleMessagesDeleteEvent(payload: any) {
    this.server.emit(`deleteMessage${payload.roomsUpdate._id}`, await payload);
  }
  @OnEvent('messages.deleted')
  async handleLastMessagesUpdateEvent(payload: any) {
    this.server.emit(
      `updateLastMessages${payload.userActions}`,
      await payload.roomsUpdate,
    );
    if (payload.userActions === payload.roomsUpdate.recipient.email) {
      return this.server.emit(
        `updateLastMessages${payload.roomsUpdate.creator.email}`,
        await payload.roomsUpdate,
      );
    }
    if (payload.userActions === payload.roomsUpdate.creator.email) {
      return this.server.emit(
        `updateLastMessages${payload.roomsUpdate.recipient.email}`,
        await payload.roomsUpdate,
      );
    }
  }
  @OnEvent('messages.updated')
  async handleUpdatedMessagesEvent(payload: any) {
    const messagesCN = await this.messagesService.getMessages(
      payload.roomsUpdate._id,
    );
    const payLoading = {
      dataLoading: payload,
      messagesCN,
    };
    this.server.emit(`updatedMessage${payload.roomsUpdate._id}`, payLoading);
  }
  @OnEvent('messages.updated')
  async handleUpdatedEvent(payload: any) {
    this.server.emit(
      `updateLastMessagesed${payload.email}`,
      await payload.roomsUpdate,
    );
    if (payload.email === payload.roomsUpdate.recipient.email) {
      return this.server.emit(
        `updateLastMessagesed${payload.roomsUpdate.creator.email}`,
        await payload.roomsUpdate,
      );
    }
    if (payload.email === payload.roomsUpdate.creator.email) {
      return this.server.emit(
        `updateLastMessagesed${payload.roomsUpdate.recipient.email}`,
        await payload.roomsUpdate,
      );
    }
  }
  @OnEvent('accept.friends')
  async handleAcceptFriend(payload: any) {
    const idRooms = payload.roomsUpdateMessage._id;
    const idP = idRooms.toString();
    this.server.emit(`acceptFriends${idP}`, await payload.roomsUpdateMessage);
  }
  @OnEvent('accept.friends')
  async handleSeeAddFriend(payload: any) {
    this.server.emit(
      `updateSendedFriend${payload.emailUserActions}`,
      await payload.roomsUpdateMessage,
    );
    if (
      payload.emailUserActions === payload.roomsUpdateMessage.recipient.email
    ) {
      return this.server.emit(
        `updateSendedFriend${payload.roomsUpdateMessage.creator.email}`,
        await payload.roomsUpdateMessage,
      );
    }
    if (payload.emailUserActions === payload.roomsUpdateMessage.creator.email) {
      return this.server.emit(
        `updateSendedFriend${payload.roomsUpdateMessage.recipient.email}`,
        await payload.roomsUpdateMessage,
      );
    }
  }
}
