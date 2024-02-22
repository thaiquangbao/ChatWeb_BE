import { CreateUserDetails } from 'src/untills/types';

export interface IUserService {
  createUser(userDetail: CreateUserDetails);
}
