import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Routes, Services } from 'src/untills/constain';
import { GroupRoomsService } from './group-rooms.service';
import { AuthenticatedGuard } from 'src/auth/untills/Guards';
import { UsersPromise } from 'src/auth/dtos/Users.dto';
import {
  CreateGroupsDto,
  Franchiser,
  InvitedGroupsDto,
  KickUser,
  UpdateGroupsRooms,
} from './dtos/group.dto';
import { AuthUser } from 'src/untills/decorater';
import { Response } from 'express';
import { GetMessagesGroupDTO } from 'src/chat-group/dtos/chat-group.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller(Routes.GROUPS)
@UseGuards(AuthenticatedGuard)
export class GroupRoomsController {
  constructor(
    @Inject(Services.GROUPS) private readonly groupServices: GroupRoomsService,
    private readonly events: EventEmitter2,
  ) {}
  @Post()
  async createGroups(
    @AuthUser() user: UsersPromise,
    @Body() createRooms: CreateGroupsDto,
    @Res() res: Response,
  ) {
    try {
      const groups = await this.groupServices.createGroups(user, createRooms);
      this.events.emit('groups.create', groups);
      return res.send(groups);
    } catch (error) {
      return error;
    }
  }
  @Get()
  async getGroups(@AuthUser() user: UsersPromise, @Res() res: Response) {
    try {
      const groups = await this.groupServices.getGroups(user);
      return res.send(groups);
    } catch (error) {
      return res.send(error);
    }
  }
  @Get(':id')
  async getGroupsById(
    @AuthUser() user: UsersPromise,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    try {
      const groups = await this.groupServices.getGroupsById(id);
      return res.send(groups);
    } catch (error) {
      return res.send(error);
    }
  }
  @Delete('deleteGroups/:id')
  async deleteGroups(
    @AuthUser() user: UsersPromise,
    @Res() res: Response,
    @Param() id: string,
  ) {
    try {
      const deleteGroups = await this.groupServices.deleteGroups(user, id);
      this.events.emit('delete.groups', deleteGroups);
      return res.send(deleteGroups);
    } catch (error) {
      console.log(error);
      return res.send(error);
    }
  }
  @Post('leaveGroups')
  async leaveGroups(
    @AuthUser() user: UsersPromise,
    @Res() res: Response,
    @Body() groupMessages: GetMessagesGroupDTO,
  ) {
    try {
      const leaveGroups = await this.groupServices.leaveGroups(
        user,
        groupMessages.groupId,
      );
      this.events.emit('leave.groups', leaveGroups);
      return res.send(leaveGroups);
    } catch (error) {
      console.log(error);
      return res.send(error);
    }
  }
  @Post('attendGroups')
  async attendGroups(
    @AuthUser() user: UsersPromise,
    @Res() res: Response,
    @Body() groupMessages: InvitedGroupsDto,
  ) {
    try {
      const attendGroups = await this.groupServices.inviteToGroups(
        user,
        groupMessages.groupId,
        groupMessages.participants,
      );
      this.events.emit('attend.groups', attendGroups);
      return res.send(attendGroups);
    } catch (error) {
      console.log(error);
      return res.send(error);
    }
  }
  @Post('updateGroups')
  async updateGroups(
    @AuthUser() user: UsersPromise,
    @Body() updateGroupsRooms: UpdateGroupsRooms,
    @Res() res: Response,
  ) {
    try {
      const result = await this.groupServices.updateGroups(
        user,
        updateGroupsRooms,
      );
      this.events.emit('update.groups', result);
      return res.send(result);
    } catch (error) {
      console.log(error);
      return res.send(error);
    }
  }
  @Post('kickUsersGroups')
  async kickGroups(
    @AuthUser() user: UsersPromise,
    @Res() res: Response,
    @Body() userKick: KickUser,
  ) {
    try {
      const kickGroups = await this.groupServices.kickGroups(user, userKick);
      this.events.emit('kick-users.groups', kickGroups);
      return res.send(kickGroups);
    } catch (error) {
      console.log(error);
      return res.send(error);
    }
  }
  @Post('franchiseUsersGroups')
  async franchiseGroups(
    @AuthUser() user: UsersPromise,
    @Res() res: Response,
    @Body() franchiser: Franchiser,
  ) {
    console.log(franchiser);
    try {
      const franchiseGroups = await this.groupServices.franchiseLeader(
        user,
        franchiser,
      );
      this.events.emit('franchise.groups', franchiseGroups);
      return res.send(franchiseGroups);
    } catch (error) {
      console.log(error);
      return res.send(error);
    }
  }
}
