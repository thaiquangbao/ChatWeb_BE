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
import * as session from 'express-session';
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
})
export class MessagingGateway implements OnGatewayConnection {
  constructor(
    @Inject(Services.ROOMS)
    private readonly roomsService: IRoomsService,
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
    this.server.emit('onRooms', payload);
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
  // @SubscribeMessage('onUserTyping')
  // async handleUserTyping(
  //   @MessageBody() data: any,
  //   @ConnectedSocket() client: any,
  // ) {
  //   console.log('User is typing');
  //   //const idRooms = await this.roomsService.findById(data.roomsId);
  //   console.log(data.roomsId);
  //   console.log(client.session);
  // }
}
