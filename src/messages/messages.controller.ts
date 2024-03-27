import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  Inject,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Routes, Services } from '../untills/constain';
import { IMessageService } from './messages';
import { CreateMessagesDTO, RoomMessages } from './dto/Messages.dto';
import { AuthUser } from 'src/untills/decorater';
import { UsersPromise } from 'src/auth/dtos/Users.dto';
import { Response, Request } from 'express';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DeleteMessages } from 'src/untills/types';
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
    @Req() req: Request,
  ) {
    //const cookie = req.cookies.Session_JS;
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
  @Delete(':id/:idMessages/:idLastMessageSent/:email')
  async deleteMessages(
    @Param('id') id: string,
    @Param('idMessages') idMessages: string,
    @Param('idLastMessageSent') idLastMessageSent: string,
    @Param('email') email: string,
  ) {
    try {
      const informationMess: DeleteMessages = {
        idMessages,
        idLastMessageSent,
        email,
      };
      const updateMess = await this.messageServices.deleteMessages(
        id,
        informationMess,
      );
      this.events.emit('messages.deleted', updateMess);
      return updateMess;
    } catch (error) {
      return error;
    }
  }
}
