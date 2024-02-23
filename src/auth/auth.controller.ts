import { Body, Controller, Inject, Post } from '@nestjs/common';
import { Routes, Services } from 'src/untills/constain';
import { IAuthService } from './auth';
import { CreateUsers } from './dtos/Users.dto';
import { IUserService } from 'src/users/users';
// import { instanceToPlain } from 'class-transformer';
@Controller(Routes.AUTH)
export class AuthController {
  constructor(
    @Inject(Services.AUTH) private authService: IAuthService,
    @Inject(Services.USERS) private userService: IUserService,
  ) {}
  @Post('register')
  async register(@Body() authDTO: CreateUsers) {
    return await this.userService.createUser(authDTO);
  }
}
