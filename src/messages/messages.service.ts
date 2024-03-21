import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { IMessageService } from './messages';
import { Messages } from 'src/entities/Message';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateMessageParams, CreateMessageResponse } from '../untills/types';
import { Rooms } from 'src/entities/Rooms';

@Injectable()
export class MessagesService implements IMessageService {
  constructor(
    @InjectModel(Messages.name) private readonly messagesModel: Model<Messages>,
    @InjectModel(Rooms.name) private roomsModel: Model<Rooms>,
  ) {}
  async getMessages(id: string): Promise<Messages[]> {
    const objectIdRoomId = new mongoose.Types.ObjectId(id);
    const messges = await this.messagesModel.find({
      'rooms._id': objectIdRoomId,
    });
    return messges;
  }
  async createMessages(
    params: CreateMessageParams,
  ): Promise<CreateMessageResponse> {
    const { user, content, roomsID } = params;
    const rooms = await this.roomsModel
      .findOne({ _id: roomsID })
      .populate('creator')
      .populate('recipient');
    if (!rooms) {
      throw new HttpException('Room not exist', HttpStatus.BAD_REQUEST);
    }
    const { recipient, creator } = rooms;
    // if (creator.email !== user.email && recipient.email !== user.email) {
    //   throw new HttpException('Not create Messages', HttpStatus.BAD_REQUEST);
    // }
    if (creator.email !== user.email && recipient.email !== user.email) {
      throw new HttpException('Not create Messages', HttpStatus.BAD_REQUEST);
    }
    const newMessage = await this.messagesModel.create({
      content: content,
      rooms: rooms,
      author: user,
    });
    const messageSave = await newMessage.save();
    const dataMessage = {
      _id: messageSave._id,
      content: messageSave.content,
      author: messageSave.author.fullName,
      email: messageSave.author.email,
      createdAt: new Date(),
    };
    const dataAuth = {
      email: messageSave.author.email,
      fullName: messageSave.author.fullName,
    };
    //rooms.lastMessageSent = messageSave;
    const dataLastMessages = {
      _id: messageSave._id,
      content: messageSave.content,
      author: dataAuth,
      createdAt: new Date(),
    };
    // Cập nhật lại lastMessage vào phòng chat bỏ id messges vào trong đó
    const updated = await this.roomsModel.findOneAndUpdate(
      { _id: rooms.id },
      {
        $set: { lastMessageSent: dataLastMessages },
        $push: { messages: dataMessage },
      },
      { new: true },
    );
    //return messageSave;
    return { message: messageSave, rooms: updated };
  }
}
