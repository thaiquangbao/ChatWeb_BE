import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { IUserService } from './users';
import { CreateUserDetails, FindUserByEmail } from 'src/untills/types';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/entities/users';
import { hashPassword } from 'src/untills/helpers';
import { CheckUsers, ValidAccount } from 'src/auth/dtos/Users.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService implements IUserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private mailService: MailerService,
    private jwtService: JwtService,
  ) {}
  private generatedCode: string = '';
  findUsers(informationUser: FindUserByEmail): Promise<User> {
    return this.userModel.findOne(informationUser);
  }
  private generateRandomString(length: number): string {
    const characters = '0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }
    return result;
  }
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
    const token = this.jwtService.sign({ id: '98324986328' });
    return { token, userDetail };
  }
  async findUser(findUserParams: CheckUsers): Promise<User> {
    const result = await this.userModel.findOne(findUserParams);
    return result;
  }
  async sendMail(authDTO: CreateUserDetails): Promise<boolean> {
    this.generatedCode = this.generateRandomString(6);
    const send = await this.mailService.sendMail({
      to: authDTO.email,
      from: 'haisancomnieuphanthiet@gmail.com',
      subject: 'Welcome to ZEN CHAT',
      html: `<b>ZEN CHAT: Mã xác nhận của bạn là ${this.generatedCode}</b>`,
      context: {
        name: authDTO.fullName,
      },
    });
    if (send) {
      console.log(this.generatedCode);
      return true;
    } else {
      return false;
    }
  }
  async validVertical(validCode: ValidAccount) {
    //const userId = this.userEntity.findOne({ email: user.email });
    if (validCode.code !== this.generatedCode) {
      throw new HttpException('Mã không đúng', HttpStatus.CONFLICT);
    }
    const password = await hashPassword(validCode.passWord);
    const result = await this.userModel.create({
      fullName: validCode.fullName,
      phoneNumber: validCode.phoneNumber,
      email: validCode.email,
      passWord: password,
      dateOfBirth: validCode.dateOfBirth,
      avatar: validCode.avatar,
    });
    console.log('UserService.createUser');
    return result.save();
  }
}
