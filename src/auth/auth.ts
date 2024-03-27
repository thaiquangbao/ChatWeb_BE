import { User } from 'src/entities/users';
import { findAuth, ValidateUserDetails } from '../untills/types';

export interface IAuthService {
  validateUser(createUserDetail: ValidateUserDetails): Promise<User | null>;
  findAuthenticate(findAuthenticate: findAuth): Promise<User | null>;
}
