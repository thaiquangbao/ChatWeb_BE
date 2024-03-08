import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { Routes, Services } from '../untills/constain';
import { IMessageService } from './messages';
import { CreateMessagesDTO } from './dto/Messages.dto';
import { AuthUser } from 'src/untills/decorater';
import { UsersPromise } from 'src/auth/dtos/Users.dto';

@Controller(Routes.MESSAGES)
export class MessagesController {
  constructor(
    @Inject(Services.MESSAGES)
    private readonly messageServices: IMessageService,
  ) {}
  @Post()
  async createMessage(
    @AuthUser() user: UsersPromise,
    //@Param('id') id: string,
    @Body() createMessagesDTO: CreateMessagesDTO,
  ) {
    //const params = { user, id, content };
    return this.messageServices.createMessages({ ...createMessagesDTO, user });
  }
  @Get(':roomsId')
  getMessageFromRooms(
    @AuthUser() user: UsersPromise,
    @Param('roomsId') roomsId: string,
  ) {
    return this.messageServices.getMessages(roomsId);
  }
}
