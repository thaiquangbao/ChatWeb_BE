import { UsersPromise } from 'src/auth/dtos/Users.dto';
import { GroupRooms } from 'src/entities/Groups';
import { CreateGroupParams, FetchGroupParams } from 'src/untills/types';

export interface IGroups {
  createGroups(
    userCreate: UsersPromise,
    createGroupParams: CreateGroupParams,
  ): Promise<GroupRooms>;
  getGroups(userCreate: UsersPromise): Promise<GroupRooms[]>;
  getGroupsById(id: string): Promise<GroupRooms>;
}
