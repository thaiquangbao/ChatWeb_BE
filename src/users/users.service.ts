import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { IUserService } from './users';
import { CreateUserDetails } from 'src/untills/types';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/entities/users';
import { hashPassword } from 'src/untills/helpers';

@Injectable()
export class UsersService implements IUserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}
  async createUser(userDetail: CreateUserDetails) {
    const existingUser = await this.userModel.findOne({
      email: userDetail.email,
    });
    const existingPhone = await this.userModel.findOne({
      phoneNumber: userDetail.phoneNumber,
    });
    if (existingUser) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }
    if (existingPhone) {
      throw new HttpException(
        'PhoneNumber is already in use',
        HttpStatus.CONFLICT,
      );
    }
    const password = await hashPassword(userDetail.passWord);
    const result = await this.userModel.create({
      ...userDetail,
      passWord: password,
    });
    console.log('UserService.createUser');
    return result.save();
  }
}
