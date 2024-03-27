import { IsNotEmpty, IsString } from 'class-validator';
import { UsersPromise } from '../../auth/dtos/Users.dto';
import { Rooms } from 'src/entities/Rooms';

export class MessagesDTO {
  content: string;
  author: UsersPromise;
}
export class CreateMessagesDTO {
  @IsNotEmpty()
  @IsString()
  content: string;
  @IsNotEmpty()
  @IsString()
  roomsID: string;
}
export class RoomMessages {
  roomsId: string;
}
export class RoomAfterDeleteMessages {
  rooms: Rooms;
  isSuccess: boolean;
}
