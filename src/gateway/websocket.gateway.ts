import { OnEvent } from '@nestjs/event-emitter';
import {
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'],
  },
})
export class MessagingGateway implements OnGatewayConnection {
  handleConnection(client: any, ...args: any[]) {
    console.log(client.id);
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
  handleMessagesCreateEvent(payload: any){
    console.log('Đã vào được chức năng tạo messages');
    this.server.emit('onMessages', payload);
  }
  @OnEvent('rooms.create')
  handleRoomsCreateEvent(payload: any){
    console.log('Đã vào được chức năng tạo messages');
    this.server.emit('onRooms', payload);
  }
}
