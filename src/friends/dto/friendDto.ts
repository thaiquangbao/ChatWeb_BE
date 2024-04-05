import { Rooms } from 'src/entities/Rooms';
import { User } from 'src/entities/users';

export class SendFriendDto {
  userSend: User;
  userAccept: User;
}
export class IdWantMakeFriend {
  id: string;
}
export class AcceptFriendDto {
  emailUserActions: string;
  userSend: User;
  userAccept: User;
  roomsUpdateMessage: Rooms;
}
export class DeleteFriendDto {
  emailUserActions: string;
  userActions: User;
  userAccept: User;
}
