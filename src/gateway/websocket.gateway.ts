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
import { IMessageService } from 'src/messages/messages';
import { Model } from 'mongoose';
import { Messages } from 'src/entities/Message';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/entities/users';
import { MessagesGroup } from 'src/entities/MessagesGroup';
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
})
export class MessagingGateway implements OnGatewayConnection {
  constructor(
    @InjectModel(Messages.name) private readonly messagesModel: Model<Messages>,
    @InjectModel(User.name) private readonly usersModel: Model<User>,
    @Inject(Services.MESSAGES)
    private readonly messagesService: IMessageService,
    @Inject(Services.ROOMS)
    private readonly roomsService: IRoomsService,
    @InjectModel(MessagesGroup.name)
    private messageGroupsModel: Model<MessagesGroup>,
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
    client.to(data.roomsId).emit(`userJoin${data.roomsId}`);
  }
  @SubscribeMessage('onRoomLeave')
  async onLeaveRooms(@MessageBody() data: any, @ConnectedSocket() client: any) {
    console.log('Đã rời tham gia phòng');
    client.join(data.roomsId);
    console.log(client.session);
    client.to(data.roomsId).emit(`userLeave${data.roomsId}`);
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
    console.log(payload.emailUserActions);
    if (
      payload.emailUserActions === payload.roomsUpdateMessage.recipient.email
    ) {
      console.log(payload.roomsUpdateMessage.creator.email);
      return this.server.emit(
        `updateSendedFriend${payload.roomsUpdateMessage.creator.email}`,
        await payload.roomsUpdateMessage,
      );
    }
    if (payload.emailUserActions === payload.roomsUpdateMessage.creator.email) {
      console.log(payload.roomsUpdateMessage.recipient.email);
      return this.server.emit(
        `updateSendedFriend${payload.roomsUpdateMessage.recipient.email}`,
        await payload.roomsUpdateMessage,
      );
    }
  }
  @OnEvent('accept.friends')
  async handleSeeAddFriendRoom(payload: any) {
    const idRooms = payload.roomsUpdateMessage._id;
    const idP = idRooms.toString();
    this.server.emit(
      `updateSendedFriend${idP}${payload.emailUserActions}`,
      await payload.roomsUpdateMessage,
    );
    if (
      payload.emailUserActions === payload.roomsUpdateMessage.recipient.email
    ) {
      return this.server.emit(
        `updateSendedFriend${idP}${payload.roomsUpdateMessage.creator.email}`,
        await payload.roomsUpdateMessage,
      );
    }
    if (payload.emailUserActions === payload.roomsUpdateMessage.creator.email) {
      return this.server.emit(
        `updateSendedFriend${idP}${payload.roomsUpdateMessage.recipient.email}`,
        await payload.roomsUpdateMessage,
      );
    }
  }
  @OnEvent('accept.friends')
  async handleAddFriendGroup(payload: any) {
    this.server.emit(
      `updateAcceptFriendsGroups${payload.userSend.email}`,
      await payload.roomsUpdateMessage,
    );
    if (payload.userSend.email !== payload.userAccept.email) {
      return this.server.emit(
        `updateAcceptFriendsGroups${payload.userAccept.email}`,
        await payload.roomsUpdateMessage,
      );
    }
  }
  @OnEvent('rooms.delete')
  async handleDeleteRooms(payload: any) {
    const idRooms = payload._id;
    const idP = idRooms.toString();
    this.server.emit(`deleteRooms${idP}`, await payload);
  }
  @OnEvent('unfriends.friends')
  async handleDeleteUnfriendsRooms(payload: any) {
    const customer = {
      emailUserActions: payload.emailUserActions,
      userActions: payload.userActions,
      userAccept: payload.userAccept,
      roomsUpdate: payload.roomsUpdate,
      reload: false,
    };
    this.server.emit(`unfriends${payload.emailUserActions}`, customer);
    if (payload.emailUserActions === payload.userActions.email) {
      return this.server.emit(
        `unfriends${payload.userAccept.email}`,
        await payload,
      );
    }
    if (payload.emailUserActions === payload.userAccept.email) {
      return this.server.emit(
        `unfriends${payload.userActions.email}`,
        await payload,
      );
    }
  }
  @OnEvent('unfriends.friends')
  async handleDeleteUnfriendsGroups(payload: any) {
    this.server.emit(
      `updateUnFriendsGroups${payload.userActions.email}`,
      await payload,
    );
    if (payload.userActions.email !== payload.userAccept.email) {
      return this.server.emit(
        `updateUnFriendsGroups${payload.userAccept.email}`,
        await payload,
      );
    }
  }
  @OnEvent('send.friends')
  async handleSendFriendRooms(payload: any) {
    const action = {
      emailUserActions: payload.userActions.email,
      userActions: payload.userSend,
      userAccept: payload.userAccept,
      reload: true,
    };
    this.server.emit(`sendfriends${payload.userActions.email}`, action);
    if (payload.userActions.email === payload.userSend.email) {
      return this.server.emit(
        `sendfriends${payload.userAccept.email}`,
        await payload,
      );
    }
    if (payload.userActions.email === payload.userAccept.email) {
      return this.server.emit(
        `sendfriends${payload.userActions.email}`,
        await payload,
      );
    }
  }
  @OnEvent('undo.friends')
  async handleUndoFriendRooms(payload: any) {
    this.server.emit(`undo${payload.emailUserActions}`, payload);
    if (payload.emailUserActions === payload.userActions.email) {
      return this.server.emit(`undo${payload.userAccept.email}`, await payload);
    }
    if (payload.emailUserActions === payload.userAccept.email) {
      return this.server.emit(
        `undo${payload.userActions.email}`,
        await payload,
      );
    }
  }
  @OnEvent('messages.emoji')
  async handleEmoji(payload: any) {
    const newMess = await this.messagesModel.findById(payload.idMessages);
    const dataMessages = {
      idMessages: payload.idMessages,
      messagesUpdate: newMess,
      roomsUpdate: payload.roomsUpdate,
    };
    return this.server.emit(`emoji${payload.roomsUpdate.id}`, dataMessages);
  }
  @OnEvent('groups.create')
  async handleGroupsCreateEvent(payload: any) {
    //console.log('Đã vào được chức năng tạo messages');
    this.server.emit(`createGroups${payload.creator.email}`, payload);
    payload.participants.forEach((participant) => {
      if (payload.creator.email !== participant.email) {
        return this.server.emit(`createGroups${participant.email}`, payload);
      }
    });
  }
  @OnEvent('delete.groups')
  async handleGroupsDeleteEvent(payload: any) {
    //console.log('Đã vào được chức năng tạo messages');
    this.server.emit(`deleteGroups${payload.creator.email}`, payload);
    payload.participants.forEach((participant) => {
      if (payload.creator.email !== participant.email) {
        return this.server.emit(`deleteGroups${participant.email}`, payload);
      }
    });
  }
  @OnEvent('leave.groups')
  async handleGroupsLeaveEvent(payload: any) {
    //console.log('Đã vào được chức năng tạo messages');
    this.server.emit(`leaveGroups${payload.userLeave}`, payload);
    payload.groupsUpdate.participants.forEach((participant) => {
      if (payload.groupsUpdate.creator.email !== participant.email) {
        return this.server.emit(`leaveGroups${participant.email}`, payload);
      }
    });
    if (payload.userLeave !== payload.groupsUpdate.creator.email) {
      return this.server.emit(
        `leaveGroups${payload.groupsUpdate.creator.email}`,
        payload,
      );
    }
  }
  @OnEvent('leave.groups')
  async handleGroupsIdLeaveEvent(payload: any) {
    //console.log('Đã vào được chức năng tạo messages');
    this.server.emit(`leaveGroupsId${payload.groupsUpdate._id}`, payload);
  }
  @OnEvent('messagesGroups.create')
  async handleMessagesGroupsCreateEvent(payload: any) {
    this.server.emit(payload.groups._id, await payload);
  }
  @OnEvent('messagesGroups.create')
  async handleMessagesGroupsEvent(payload: any) {
    this.server.emit(
      `createMessageGroups${payload.groups.creator.email}`,
      payload,
    );
    payload.groups.participants.forEach((participant) => {
      if (payload.groups.creator.email !== participant.email) {
        return this.server.emit(
          `createMessageGroups${participant.email}`,
          payload,
        );
      }
    });
  }
  @OnEvent('messages-group.emoji')
  async handleEmojiGroupsEvent(payload: any) {
    const newMess = await this.messageGroupsModel.findById(payload.idMessages);
    const dataMessages = {
      idMessages: payload.idMessages,
      messagesUpdate: newMess,
      groupsUpdate: payload.groupsUpdate,
    };
    return this.server.emit(
      `emojiGroup${payload.groupsUpdate._id}`,
      dataMessages,
    );
  }
  @OnEvent('messages-group.deleted')
  async handleMessagesGroupsDeleteEvent(payload: any) {
    this.server.emit(
      `deleteMessageGroup${payload.groupsUpdate._id}`,
      await payload,
    );
  }
  @OnEvent('messages-group.deleted')
  async handleLastMessagesGroupsDeleteEvent(payload: any) {
    this.server.emit(
      `deleteLastMessagesGroups${payload.groupsUpdate.creator.email}`,
      await payload,
    );
    payload.groupsUpdate.participants.forEach((participant) => {
      if (payload.groupsUpdate.creator.email !== participant.email) {
        return this.server.emit(
          `deleteLastMessagesGroups${participant.email}`,
          payload,
        );
      }
    });
  }
  @OnEvent('messages-groups.recall')
  async handleMessagesGroupsRecallEvent(payload: any) {
    this.server.emit(
      `recallMessageGroup${payload.groupsUpdate._id}`,
      await payload,
    );
  }
  @OnEvent('messages-groups.recall')
  async handleLastMessagesGroupsRecallEvent(payload: any) {
    this.server.emit(
      `recallLastMessagesGroups${payload.groupsUpdate.creator.email}`,
      await payload,
    );
    payload.groupsUpdate.participants.forEach((participant) => {
      if (payload.groupsUpdate.creator.email !== participant.email) {
        return this.server.emit(
          `recallLastMessagesGroups${participant.email}`,
          payload,
        );
      }
    });
  }
  @OnEvent('attend.groups')
  async handleAttendGroupsEvent(payload: any) {
    this.server.emit(`attendGroup${payload.groupsUpdate._id}`, await payload);
  }
  @OnEvent('attend.groups')
  async handleAttendGroupsMessagesEvent(payload: any) {
    this.server.emit(
      `attendMessagesGroup${payload.groupsUpdate.creator.email}`,
      await payload,
    );
    payload.groupsUpdate.participants.forEach((participant) => {
      if (payload.groupsUpdate.creator.email !== participant.email) {
        return this.server.emit(
          `attendMessagesGroup${participant.email}`,
          payload,
        );
      }
    });
    payload.userAttends.forEach((participant) => {
      if (payload.groupsUpdate.creator.email !== participant.email) {
        return this.server.emit(
          `attendMessagesGroupsss${participant.email}`,
          payload,
        );
      }
    });
  }
  @OnEvent('messagesGroups.createWithFeedBack')
  async handleMessagesGroupsCreateWithFeedBackEvent(payload: any) {
    this.server.emit(`feedBackGroup${payload.groups._id}`, await payload);
  }
  @OnEvent('messagesGroups.createWithFeedBack')
  async handleMessagesGroupsWithFeedBackEvent(payload: any) {
    this.server.emit(
      `feedBackLastMessagesGroup${payload.groups.creator.email}`,
      payload,
    );
    payload.groups.participants.forEach((participant) => {
      if (payload.groups.creator.email !== participant.email) {
        return this.server.emit(
          `feedBackLastMessagesGroup${participant.email}`,
          payload,
        );
      }
    });
  }
  @OnEvent('update.groups')
  async handleUpdateGroups(payload: any) {
    this.server.emit(`updateGroup${payload._id}`, await payload);
  }
  @OnEvent('update.groups')
  async handleUpdateUserGroups(payload: any) {
    this.server.emit(
      `updateAttendGroup${payload.creator.email}`,
      await payload,
    );
    payload.participants.forEach((participant) => {
      if (payload.creator.email !== participant.email) {
        return this.server.emit(
          `updateAttendGroup${participant.email}`,
          payload,
        );
      }
    });
  }
  @OnEvent('kick-users.groups')
  async handleKickGroups(payload: any) {
    this.server.emit(`kickOutGroup${payload.groupsUpdate._id}`, await payload);
  }
  @OnEvent('kick-users.groups')
  async handleKickUserGroups(payload: any) {
    this.server.emit(
      `updateKickGroup${payload.groupsUpdate.creator.email}`,
      await payload,
    );
    this.server.emit(`updateKickGroup${payload.userKicked}`, await payload);
    payload.groupsUpdate.participants.forEach((participant) => {
      if (payload.groupsUpdate.creator.email !== participant.email) {
        return this.server.emit(`updateKickGroup${participant.email}`, payload);
      }
    });
  }
}
