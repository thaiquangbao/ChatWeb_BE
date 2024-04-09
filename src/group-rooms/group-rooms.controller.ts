import {
  Body,
  Controller,
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
import { CreateGroupsDto } from './dtos/group.dto';
import { AuthUser } from 'src/untills/decorater';
import { Response } from 'express';
import { FetchGroupParams } from 'src/untills/types';

@Controller(Routes.GROUPS)
@UseGuards(AuthenticatedGuard)
export class GroupRoomsController {
  constructor(
    @Inject(Services.GROUPS) private readonly groupServices: GroupRoomsService,
  ) {}
  @Post()
  async createGroups(
    @AuthUser() user: UsersPromise,
    @Body() createRooms: CreateGroupsDto,
    @Res() res: Response,
  ) {
    try {
      const groups = await this.groupServices.createGroups(user, createRooms);
      return res.send(groups);
    } catch (error) {
      return res.send(error);
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
}
