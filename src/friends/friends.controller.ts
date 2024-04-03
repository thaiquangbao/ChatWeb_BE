import {
  Controller,
  Inject,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { Routes, Services } from 'src/untills/constain';
import { IFriendsService } from './friends';
import { AuthenticatedGuard } from 'src/auth/untills/Guards';
import { AuthUser } from 'src/untills/decorater';
import { UsersPromise } from 'src/auth/dtos/Users.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
@Controller(Routes.FRIENDS)
export class FriendsController {
  constructor(
    @Inject(Services.FRIENDS) private readonly friendsService: IFriendsService,
    private readonly events: EventEmitter2,
  ) {}
  @Post(':id')
  @UseGuards(AuthenticatedGuard)
  async sendFriends(
    @Param() id: string,
    @AuthUser() userAuth: UsersPromise,
    @Res() res: Response,
  ) {
    try {
      const sended = await this.friendsService.sendFriendInvitations(
        id,
        userAuth.id,
      );
      this.events.emit('send friend', sended);
      return res.status(200).send(sended);
    } catch (error) {
      return res.status(400).send(error);
    }
  }
  @Post('accept/:id')
  @UseGuards(AuthenticatedGuard)
  async acceptFriends(
    @Param() id: string,
    @AuthUser() userAuth: UsersPromise,
    @Res() res: Response,
  ) {
    try {
      const accepted = await this.friendsService.acceptFriends(id, userAuth.id);
      this.events.emit('send friend', accepted);
      return res.status(200).send(accepted);
    } catch (error) {
      return res.status(400).send(error);
    }
  }
}
