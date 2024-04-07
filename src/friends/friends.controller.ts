import {
  Body,
  Controller,
  Inject,
  Param,
  Patch,
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
import { FindRooms, SendFriendInvitations } from 'src/untills/types';
import { IdWantMakeFriend, IdWantUndo } from './dto/friendDto';
@Controller(Routes.FRIENDS)
@UseGuards(AuthenticatedGuard)
export class FriendsController {
  constructor(
    @Inject(Services.FRIENDS) private readonly friendsService: IFriendsService,
    private readonly events: EventEmitter2,
  ) {}
  @Post()
  async sendFriends(
    @Body() friend: IdWantMakeFriend,
    @AuthUser() userAuth: UsersPromise,
    @Res() res: Response,
  ) {
    try {
      const sended = await this.friendsService.sendFriendInvitations(
        friend.id,
        userAuth.id,
      );
      this.events.emit('send.friends', sended);
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
    @Body() rooms: FindRooms,
    @Res() res: Response,
  ) {
    try {
      const accepted = await this.friendsService.acceptFriends(
        id,
        userAuth.id,
        rooms.idRooms,
      );
      this.events.emit('accept.friends', accepted);
      return res.status(200).send(accepted);
    } catch (error) {
      return res.status(400).send(error);
    }
  }
  @Post('unfriends/:id')
  @UseGuards(AuthenticatedGuard)
  async unfriends(
    @Param() id: string,
    @Body() rooms: SendFriendInvitations,
    @AuthUser() userAuth: UsersPromise,
    @Res() res: Response,
  ) {
    try {
      const deleteFriends = await this.friendsService.unfriends(
        id,
        userAuth.id,
        rooms.id,
      );
      this.events.emit('unfriends.friends', deleteFriends);
      return res.send(deleteFriends).status(200);
    } catch (error) {
      return res.send(error);
    }
  }
  @Post('undo')
  @UseGuards(AuthenticatedGuard)
  async undo(
    @Body() id: IdWantUndo,
    @AuthUser() userAuth: UsersPromise,
    @Res() res: Response,
  ) {
    try {
      const undoFriends = await this.friendsService.undoFriends(
        id.id,
        userAuth.id,
        id.idRooms,
      );
      this.events.emit('undo.friends', undoFriends);
      return res.send(undoFriends).status(200);
    } catch (error) {
      return res.send(error);
    }
  }
}
