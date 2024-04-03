import { User } from 'src/entities/users';

export class SendFriendDto {
  userSend: User;
  userAccept: User;
}
