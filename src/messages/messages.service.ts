import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { IMessageService } from './messages';
import { Messages } from 'src/entities/Message';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMessageParams } from '../untills/types';
import { Rooms } from 'src/entities/Rooms';

@Injectable()
export class MessagesService implements IMessageService {
  constructor(
    @InjectModel(Messages.name) private readonly messagesModel: Model<Messages>,
    @InjectModel(Rooms.name) private roomsModel: Model<Rooms>,
  ) {}
  getMessages(id: string): Promise<Messages[]> {
    return this.messagesModel.find({ 'rooms._id': id });
  }
  async createMessages(params: CreateMessageParams): Promise<Messages> {
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
    console.log(recipient.email, creator.email);
    console.log(user.email);
    if (creator.email !== user.email && recipient.email !== user.email) {
      throw new HttpException('Not create Messages', HttpStatus.BAD_REQUEST);
    }
    const newMessage = await this.messagesModel.create({
      content: content,
      rooms: rooms,
      author: user,
    });
    const messageSave = await newMessage.save();
    return messageSave;
    //rooms.lastMessageSent = messageSave;
    // const updated = await this.roomsModel.findByIdAndUpdate(
    //   rooms._id,
    //   { lastMessageSent: messageSave },
    //   { new: true },
    // );
    // return { message: messageSave, rooms: updated };
  }
}
