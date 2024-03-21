import { Module } from '@nestjs/common';
import { MessagingGateway } from './websocket.gateway';
import { Services } from '../untills/constain';
import { GateWaySessionManager } from './gateway.session';

@Module({
  providers: [
    MessagingGateway,
    // {
    //   provide: Services.GATEWAY_SESSION_MANAGER,
    //   useClass: GateWaySessionManager,
    // },
  ],
})
export class GatewayModule {}
