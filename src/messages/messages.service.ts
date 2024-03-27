import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { IMessageService } from './messages';
import { Messages } from 'src/entities/Message';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import {
  CreateMessageParams,
  CreateMessageResponse,
  DeleteMessages,
} from '../untills/types';
import { Rooms } from 'src/entities/Rooms';
import { RoomAfterDeleteMessages } from './dto/Messages.dto';
import { RoomsPromise } from 'src/room/dto/RoomDTO.dto';

@Injectable()
export class MessagesService implements IMessageService {
  constructor(
    @InjectModel(Messages.name) private readonly messagesModel: Model<Messages>,
    @InjectModel(Rooms.name) private roomsModel: Model<Rooms>,
  ) {}
  async deleteMessages(id: string, informationMess: DeleteMessages) {
    const { idMessages, idLastMessageSent, email } = informationMess;
    const findRooms: RoomsPromise = await this.roomsModel.findById(id);
    if (!findRooms) {
      throw new HttpException('Phòng không tồn tại', HttpStatus.BAD_REQUEST);
    }
    const findMessages = await this.messagesModel.findById(idMessages);
    if (!findMessages) {
      throw new HttpException('Tin nhắn không tồn tại', HttpStatus.BAD_REQUEST);
    }
    if (findMessages.author.email !== email) {
      throw new HttpException(
        'Bạn không phải là chủ tin nhắn',
        HttpStatus.BAD_REQUEST,
      );
    }
    const deletedCount = await this.messagesModel.deleteOne({
      _id: findMessages.id,
    });
    if (deletedCount.deletedCount < 1 || !deletedCount.deletedCount) {
      throw new HttpException(
        'Không thể xóa mess bước trước không thành công',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (findMessages.id === idLastMessageSent) {
      const objectIdRoomId = new mongoose.Types.ObjectId(idMessages);
      const dataMessageRemove = { _id: objectIdRoomId };
      // Xóa message và cập nhật lastMessageSent trong một bước, nếu có thể
      const updatedRoom = await this.roomsModel.findOneAndUpdate(
        { _id: id },
        { $pull: { messages: dataMessageRemove } },
        { new: true },
      );

      // Kiểm tra messages để xác định lastMessageSent mới
      const lastMessage =
        updatedRoom.messages.length > 0
          ? updatedRoom.messages[updatedRoom.messages.length - 1]
          : {};

      // Cập nhật lastMessageSent với thông tin từ message cuối cùng hoặc đặt là đối tượng rỗng nếu không còn messages
      const resultLastMessage = await this.roomsModel.findByIdAndUpdate(
        id,
        { $set: { lastMessageSent: lastMessage } },
        { new: true },
      );

      return {
        roomsUpdate: resultLastMessage,
        idMessages: idMessages,
        userActions: email,
      };
    }
    const objectIdRoomId = new mongoose.Types.ObjectId(idMessages);
    const dataMessageRemove = { _id: objectIdRoomId };
    const updateRooms = await this.roomsModel.findOneAndUpdate(
      { _id: id },
      { $pull: { messages: dataMessageRemove } },
      { new: true },
    );
    return {
      roomsUpdate: updateRooms,
      idMessages: idMessages,
      userActions: email,
    };
  }
  async getMessages(id: string): Promise<Messages[]> {
    const objectIdRoomId = new mongoose.Types.ObjectId(id);
    const messages = await this.messagesModel.find({
      'rooms._id': objectIdRoomId,
    });
    return messages;
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
