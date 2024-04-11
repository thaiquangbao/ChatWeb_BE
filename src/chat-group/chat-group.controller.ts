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
  UseGuards,
} from '@nestjs/common';
import { Routes, Services } from 'src/untills/constain';
import { IMessageGroupsService } from './chat-group';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { AuthenticatedGuard } from 'src/auth/untills/Guards';
import { AuthUser } from 'src/untills/decorater';
import { UsersPromise } from 'src/auth/dtos/Users.dto';
import {
  CreateMessagesGroupsDTO,
  GetMessagesGroupDTO,
} from './dtos/chat-group.dto';
import { Response } from 'express';
import {
  AnswerMessagesGroups,
  DeleteMessages,
  UpdateEmoji,
  UpdateGroupsMessages,
} from 'src/untills/types';
@Controller(Routes.CHATGROUPS)
@UseGuards(AuthenticatedGuard)
export class ChatGroupController {
  constructor(
    @Inject(Services.CHATGROUPS)
    private readonly chatGroupServices: IMessageGroupsService,
    private readonly events: EventEmitter2,
    private readonly cloudinaryServices: CloudinaryService,
  ) {}
  @Post()
  async createMessage(
    @AuthUser() user: UsersPromise,
    //@Param('id') id: string,
    @Body() createMessagesGroupsDTO: CreateMessagesGroupsDTO,
    @Res() res: Response,
  ) {
    try {
      const messages = await this.chatGroupServices.createMessagesForGroup({
        ...createMessagesGroupsDTO,
        user,
      });
      this.events.emit('messagesGroups.create', messages);
      return res.send(messages).status(HttpStatus.OK);
    } catch (error) {
      return res.send(error);
    }
  }
  @Post('groups')
  async getMessageFromGroups(
    @AuthUser() user: UsersPromise,
    @Body() groupMessages: GetMessagesGroupDTO,
    @Res() res: Response,
  ) {
    try {
      const messages = await this.chatGroupServices.getMessagesGroup(
        groupMessages.groupId,
      );
      return res.send(messages).status(HttpStatus.OK);
    } catch (error) {
      return error;
    }
  }
  @Delete(':id/:idMessages/:idLastMessageSent')
  async deleteMessages(
    @Param('id') id: string,
    @Param('idMessages') idMessages: string,
    @Param('idLastMessageSent') idLastMessageSent: string,
    @AuthUser() user: UsersPromise,
  ) {
    try {
      const email = user.email;
      const informationMess: DeleteMessages = {
        idMessages,
        idLastMessageSent,
        email,
      };
      const updateMess = await this.chatGroupServices.deleteMessages(
        id,
        informationMess,
      );
      this.events.emit('messages-group.deleted', updateMess);
      return updateMess;
    } catch (error) {
      return error;
    }
  }
  @Patch(':id/recallMessage')
  async updateMessages(
    @Param('id') id: string,
    @Body() updateMessage: UpdateGroupsMessages,
    @AuthUser() user: UsersPromise,
  ) {
    try {
      const updateMessages = await this.chatGroupServices.recallMessage(
        user.fullName,
        id,
        updateMessage,
      );
      this.events.emit('messages-groups.recall', {
        roomsUpdate: updateMessages,
        email: user.email,
        idMessages: updateMessage.idMessages,
      });
      return updateMessages;
    } catch (error) {
      return error;
    }
  }
  @Post(':id')
  async createMessageWithFeedBack(
    @AuthUser() user: UsersPromise,
    @Param('id') id: string,
    @Body() createMessagesGroupsDTO: AnswerMessagesGroups,
    @Res() res: Response,
  ) {
    try {
      const messages = await this.chatGroupServices.feedbackMessages(
        id,
        createMessagesGroupsDTO,
        user,
      );
      this.events.emit('messagesGroups.createWithFeedBack', messages);
      return res.send(messages).status(HttpStatus.OK);
    } catch (error) {
      return res.send(error);
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
      const updateEmoji = await this.chatGroupServices.iconOnMessages(
        id,
        updateMessage,
      );
      this.events.emit('messages-group.emoji', updateEmoji);
      return res.send(updateEmoji);
    } catch (error) {
      return res.send(error);
    }
  }
}
