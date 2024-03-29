import { Module } from '@nestjs/common';
import { MessagingGateway } from './websocket.gateway';
import { GateWaySessionManager } from './gateway.session';
import { RoomModule } from '../room/room.module';
import { MessagesModule } from 'src/messages/messages.module';

@Module({
  imports: [RoomModule, MessagesModule],
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
