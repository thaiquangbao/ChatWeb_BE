import { User } from 'src/entities/users';
import { ValidateUserDetails } from 'src/untills/types';

export interface IAuthService {
  validateUser(createUserDetail: ValidateUserDetails): Promise<User | null>;
}
