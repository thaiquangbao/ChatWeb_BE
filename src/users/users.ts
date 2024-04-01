import { UsersPromise, ValidAccount } from 'src/auth/dtos/Users.dto';
import { User } from 'src/entities/users';
import {
  CreateRoomsParams,
  CreateUserDetails,
  FindUserByEmail,
  ValidateUser,
} from 'src/untills/types';

export interface IUserService {
  createUser(userDetail: CreateUserDetails);
  findUsers(informationUser: FindUserByEmail): Promise<User>;
  sendMail(authDTO: CreateUserDetails);
  validVertical(validCode: ValidAccount);
  findUsersByEmail(roomsParams: CreateRoomsParams): Promise<UsersPromise>;
  takeAccount(account: ValidateUser);
  deleteAccount(id: string);
}
