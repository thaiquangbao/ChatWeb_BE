import { ValidAccount } from 'src/auth/dtos/Users.dto';
import { User } from 'src/entities/users';
import { CreateUserDetails, FindUserByEmail } from 'src/untills/types';

export interface IUserService {
  createUser(userDetail: CreateUserDetails);
  findUsers(informationUser: FindUserByEmail): Promise<User>;
  sendMail(authDTO: CreateUserDetails);
  validVertical(validCode: ValidAccount);
}
