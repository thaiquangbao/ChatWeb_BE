import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Routes, Services } from '../untills/constain';
import { IMessageService } from './messages';
import { CreateMessagesDTO, RoomMessages } from './dto/Messages.dto';
import { AuthUser } from 'src/untills/decorater';
import { UsersPromise } from 'src/auth/dtos/Users.dto';
import { Response } from 'express';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DeleteMessages, UpdateEmoji, UpdateMessages } from 'src/untills/types';
import { AuthenticatedGuard } from 'src/auth/untills/Guards';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
@Controller(Routes.MESSAGES)
@UseGuards(AuthenticatedGuard)
export class MessagesController {
  constructor(
    @Inject(Services.MESSAGES)
    private readonly messageServices: IMessageService,
    private readonly events: EventEmitter2,
    private readonly cloudinaryServices: CloudinaryService,
  ) {}
  @Post()
  async createMessage(
    @AuthUser() user: UsersPromise,
    //@Param('id') id: string,
    @Body() createMessagesDTO: CreateMessagesDTO,
    @Res() res: Response,
  ) {
    try {
      const messages = await this.messageServices.createMessages({
        ...createMessagesDTO,
        user,
      });
      this.events.emit('messages.create', messages);
      return res.send(messages).status(HttpStatus.OK);
    } catch (error) {
      return res.send(error);
    }
    //const cookie = req.cookies.Session_JS;
    //const params = { user, id, content };
  }
  @Post('updateFile')
  @UseInterceptors(
    FileInterceptor('file'), // Sử dụng FileInterceptor cho một file
  )
  async updateImageAVT(
    @AuthUser() user: UsersPromise,
    @UploadedFile() file: Express.Multer.File, // Sử dụng @UploadedFile() cho một file
    @Res() res: Response,
  ) {
    try {
      const imageNew = await this.cloudinaryServices.uploadFile(file);
      res.send(imageNew.url);
    } catch (error) {
      res.send(error);
    }
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
  @Patch(':id/updateMessage')
  async updateMessages(
    @Param('id') id: string,
    @Body() updateMessage: UpdateMessages,
    @AuthUser() user: UsersPromise,
  ) {
    try {
      const updateMessages = await this.messageServices.updateMessage(
        user.fullName,
        id,
        updateMessage,
      );
      this.events.emit('messages.updated', {
        roomsUpdate: updateMessages,
        email: user.email,
        idMessages: updateMessage.idMessages,
        messagesNew: updateMessage.newMessages,
      });
      return updateMessages;
    } catch (error) {
      return error;
    }
  }
  @Patch(':id/updateEmoji')
  async updateEmoji(
    @Param('id') id: string,
    @Body() updateMessage: UpdateEmoji,
    @AuthUser() user: UsersPromise,
    @Res() res: Response,
  ) {
    try {
      const updateEmoji = await this.messageServices.iconOnMessages(
        id,
        updateMessage,
      );
      // this.events.emit('messages.updated', {
      //   roomsUpdate: updateMessages,
      //   email: user.email,
      //   idMessages: updateMessage.idMessages,
      //   messagesNew: updateMessage.newMessages,
      // });
      return res.send(updateEmoji);
    } catch (error) {
      return res.send(error);
    }
  }
}
