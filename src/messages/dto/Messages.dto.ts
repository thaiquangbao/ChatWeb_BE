import { IsNotEmpty, IsString } from 'class-validator';
import { UsersPromise } from '../../auth/dtos/Users.dto';

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
