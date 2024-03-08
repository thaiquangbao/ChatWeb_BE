import { IsNotEmpty, IsString } from 'class-validator';
import { UsersPromise } from '../../auth/dtos/Users.dto';

export class RoomDTO {
  @IsString()
  @IsNotEmpty()
  email: string;
  @IsString()
  @IsNotEmpty()
  message: string;
}
export class RoomsPromise {
  id: string;
  recipient: UsersPromise;
  creator: UsersPromise;
}
