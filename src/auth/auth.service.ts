import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IAuthService } from './auth';
import { ValidateUserDetails } from 'src/untills/types';
import { IUserService } from 'src/users/users';
import { Services } from 'src/untills/constain';
import { compareHas } from 'src/untills/helpers';
import { Model } from 'mongoose';
import { User } from 'src/entities/users';
import { InjectModel } from '@nestjs/mongoose';
@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(Services.USERS) private readonly userService: IUserService,
    @InjectModel(User.name) private userEntity: Model<User>,
  ) {}
  async validateUser(userDetails: ValidateUserDetails) {
    const user = await this.userService.findUsers({ email: userDetails.email });
    if (!user)
      throw new HttpException('Invalid Credentials', HttpStatus.UNAUTHORIZED);
    const isPasswordValid = await compareHas(
      userDetails.passWord,
      user.passWord,
    );
    return isPasswordValid ? user : null;
  }
}
