import { UsersPromise } from 'src/auth/dtos/Users.dto';
import { GroupRooms } from 'src/entities/Groups';
import {
  CreateGroupParams,
  Franchiser,
  KickGroups,
  UpdateGroups,
} from 'src/untills/types';

export interface IGroups {
  createGroups(
    userCreate: UsersPromise,
    createGroupParams: CreateGroupParams,
  ): Promise<GroupRooms>;
  getGroups(userCreate: UsersPromise): Promise<GroupRooms[]>;
  getGroupsById(id: string): Promise<GroupRooms>;
  deleteGroups(user: UsersPromise, idRooms: string);
  leaveGroups(user: UsersPromise, idRooms: string);
  inviteToGroups(user: UsersPromise, idRooms: string, participants: string[]);
  updateGroups(
    user: UsersPromise,
    updateGroups: UpdateGroups,
  ): Promise<GroupRooms>;
  kickGroups(userAction: UsersPromise, kickGroups: KickGroups);
  franchiseLeader(userAction: UsersPromise, franchiser: Franchiser);
}
