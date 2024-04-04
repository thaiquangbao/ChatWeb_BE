import { SendFriendDto } from './dto/friendDto';

export interface IFriendsService {
  sendFriendInvitations(id: string, myId: string): Promise<SendFriendDto>;
  acceptFriends(
    idSender: string,
    myId: string,
    idRooms: string,
  ): Promise<SendFriendDto>;
}
