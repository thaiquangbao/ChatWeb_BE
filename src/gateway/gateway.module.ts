import { Module } from '@nestjs/common';
import { MessagingGateway } from './websocket.gateway';
import { RoomModule } from '../room/room.module';
import { MessagesModule } from 'src/messages/messages.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Messages, MessagesSchema } from 'src/entities/Message';
import { User, UsersSchema } from 'src/entities/users';
import { MessagesGroup, MessagesGroupSchema } from 'src/entities/MessagesGroup';
import { Rooms, RoomsSchema } from 'src/entities/Rooms';
import { UserOnline, UserOnlineSchema } from 'src/entities/UserOnline';

@Module({
  imports: [
    RoomModule,
    MessagesModule,
    MongooseModule.forFeature([{ name: User.name, schema: UsersSchema }]),
    MongooseModule.forFeature([
      { name: UserOnline.name, schema: UserOnlineSchema },
    ]),
    MongooseModule.forFeature([
      { name: Messages.name, schema: MessagesSchema },
    ]),
    MongooseModule.forFeature([
      { name: MessagesGroup.name, schema: MessagesGroupSchema },
    ]),
    MongooseModule.forFeature([{ name: Rooms.name, schema: RoomsSchema }]),
  ],
  providers: [
    MessagingGateway,
    // {
    //   provide: Services.GATEWAY_SESSION_MANAGER,
    //   useClass: GateWaySessionManager,
    // },
    // MessagesService,
  ],
})
export class GatewayModule {}
