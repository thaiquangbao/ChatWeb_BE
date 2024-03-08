import { CreateRoomsParams } from '../untills/types';
import { UsersPromise } from 'src/auth/dtos/Users.dto';
import { Rooms } from 'src/entities/Rooms';
// import { RoomsPromise } from './dto/RoomDTO.dto';

export interface IRoomsService {
  createRooms(
    user: UsersPromise,
    roomsParams: CreateRoomsParams,
  ): Promise<Rooms>;
  getRooms(id: string): Promise<Rooms[]>;
  findById(id: string): Promise<Rooms | undefined>;
  // hasAccess(params: AccessParams): Promise<boolean>;
  isCreated(userId: string, recipientId: string): Promise<Rooms | undefined>;
  // save(rooms: RoomsPromise): Promise<RoomsPromise>;
  // getMessages(params: GetConversationMessagesParams): Promise<RoomsPromise>;
  //update(params: UpdateConversationParams);
}
