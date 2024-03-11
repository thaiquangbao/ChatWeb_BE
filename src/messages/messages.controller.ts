import {
  Body,
  Controller,
  HttpStatus,
  Inject,
  Post,
  Res,
} from '@nestjs/common';
import { Routes, Services } from '../untills/constain';
import { IMessageService } from './messages';
import { CreateMessagesDTO, RoomMessages } from './dto/Messages.dto';
import { AuthUser } from 'src/untills/decorater';
import { UsersPromise } from 'src/auth/dtos/Users.dto';
import { Response } from 'express';
import { EventEmitter2 } from '@nestjs/event-emitter';
@Controller(Routes.MESSAGES)
export class MessagesController {
  constructor(
    @Inject(Services.MESSAGES)
    private readonly messageServices: IMessageService,
    private readonly events: EventEmitter2,
  ) {}
  @Post()
  async createMessage(
    @AuthUser() user: UsersPromise,
    //@Param('id') id: string,
    @Body() createMessagesDTO: CreateMessagesDTO,
    @Res() res: Response,
  ) {
    //const params = { user, id, content };
    const messages = await this.messageServices.createMessages({
      ...createMessagesDTO,
      user,
    });
    this.events.emit('messages.create', messages);
    return res.send(messages).status(HttpStatus.OK);
  }
  @Post('room')
  async getMessageFromRooms(
    @AuthUser() user: UsersPromise,
    @Body() roomMessages: RoomMessages,
    @Res() res: Response,
  ) {
    try {
      const messages = await this.messageServices.getMessages(
        roomMessages.roomsId,
      );
      return res.send(messages).status(HttpStatus.OK);
    } catch (error) {
      return error;
    }
  }
}
