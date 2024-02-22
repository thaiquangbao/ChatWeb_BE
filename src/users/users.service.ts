import { Injectable } from '@nestjs/common';
import { IUserService } from './users';
import { CreateUserDetails } from 'src/untills/types';

@Injectable()
export class UsersService implements IUserService {
  createUser(userDetail: CreateUserDetails) {
    console.log('UserService.createUser');
  }
}
