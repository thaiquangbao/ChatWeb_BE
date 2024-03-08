import { Body, Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '../auth/untills/Guards';
import { Routes, Services } from '../untills/constain';
import { IRoomsService } from './room';
import { RoomDTO } from './dto/RoomDTO.dto';
import { UsersPromise } from 'src/auth/dtos/Users.dto';
import { AuthUser } from '../untills/decorater';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller(Routes.ROOMS)
@UseGuards(AuthenticatedGuard)
export class RoomController {
  constructor(
    @Inject(Services.ROOMS) private readonly roomsService: IRoomsService,
    private readonly events: EventEmitter2,
  ) {}
  @Post()
  async createRooms(
    @AuthUser() user: UsersPromise,
    @Body() createRooms: RoomDTO,
  ) {
    try {
      const rooms = await this.roomsService.createRooms(user, createRooms);
      this.events.emit('rooms.create', rooms);
      console.log('createRooms');
      return rooms;
    } catch (error) {
      return error;
    }
  }
  @Get()
  async getRooms(@AuthUser() { id }: UsersPromise) {
    return this.roomsService.getRooms(id);
  }
}
