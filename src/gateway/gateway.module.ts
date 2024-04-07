import { Module } from '@nestjs/common';
import { MessagingGateway } from './websocket.gateway';
import { GateWaySessionManager } from './gateway.session';
import { RoomModule } from '../room/room.module';
import { MessagesModule } from 'src/messages/messages.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Messages, MessagesSchema } from 'src/entities/Message';

@Module({
  imports: [
    RoomModule,
    MessagesModule,
    MongooseModule.forFeature([
      { name: Messages.name, schema: MessagesSchema },
    ]),
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
