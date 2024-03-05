import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Routes, Services } from 'src/untills/constain';
import { IAuthService } from './auth';
import { CreateUsers, ValidAccount } from './dtos/Users.dto';
import { IUserService } from 'src/users/users';
import { AuthenticatedGuard, LocalAuthGuard } from './untills/Guards';
import { Response, Request } from 'express';
import { CreateUserDetails } from 'src/untills/types';
@Controller(Routes.AUTH)
export class AuthController {
  constructor(
    @Inject(Services.AUTH) private authService: IAuthService,
    @Inject(Services.USERS) private userService: IUserService,
  ) {}
  @Post('register')
  async register(@Body() authDTO: CreateUsers, @Res() res: Response) {
    const result = await this.userService.createUser(authDTO);
    try {
      res.cookie('token', result.token, { httpOnly: true });
      res.status(HttpStatus.OK).send(result);
    } catch (error) {
      res.status(error);
    }
  }
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Res() res: Response) {
    return res.send(HttpStatus.OK);
  }
  @Get('status')
  @UseGuards(AuthenticatedGuard)
  async status(@Req() req: Request, @Res() res: Response) {
    res.send(req.user);
  }
  @Post('statusValid')
  async validCode(@Body() validCode: ValidAccount, @Res() res: Response) {
    try {
      const result = await this.userService.validVertical(validCode);
      res.status(HttpStatus.OK).clearCookie('token').send(result); // Gửi phản hồi dựa trên nhu cầu của bạn
    } catch (error) {
      console.log('Mã sai');
      res.status(HttpStatus.CONFLICT).send({ message: 'Mã không đúng' });
    }
  }
  @Post('sendMail')
  async sendCode(@Body() user: CreateUserDetails, @Res() res: Response) {
    const result = await this.userService.sendMail(user);
    if (result === true) {
      try {
        res.send(HttpStatus.OK);
      } catch (error) {
        res
          .status(HttpStatus.CONFLICT)
          .send({ message: 'Không thể gửi email' });
      }
    } else {
      res.send(HttpStatus.BAD_GATEWAY);
    }
  }
}
