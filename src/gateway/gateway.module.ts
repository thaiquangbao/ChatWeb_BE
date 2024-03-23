import { Module } from '@nestjs/common';
import { MessagingGateway } from './websocket.gateway';
import { Services } from '../untills/constain';
import { GateWaySessionManager } from './gateway.session';
import { RoomModule } from '../room/room.module';

@Module({
  imports: [RoomModule],
  providers: [
    MessagingGateway,
    // {
    //   provide: Services.GATEWAY_SESSION_MANAGER,
    //   useClass: GateWaySessionManager,
    // },
  ],
})
export class GatewayModule {}
