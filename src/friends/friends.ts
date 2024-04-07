import {
  AcceptFriendDto,
  DeleteFriendDto,
  SendFriendDto,
} from './dto/friendDto';

export interface IFriendsService {
  sendFriendInvitations(id: string, myId: string): Promise<SendFriendDto>;
  acceptFriends(
    idSender: string,
    myId: string,
    idRooms: string,
  ): Promise<AcceptFriendDto>;
  unfriends(
    idSender: string,
    myId: string,
    idRooms: string,
  ): Promise<DeleteFriendDto>;
  undoFriends(
    idNotAction: string,
    myId: string,
    idRooms: string,
  ): Promise<DeleteFriendDto>;
}
