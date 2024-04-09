import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { IMessageService } from './messages';
import { Messages } from 'src/entities/Message';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import {
  CreateMessageGroupParams,
  CreateMessageParams,
  CreateMessageResponse,
  CreateMessageRoomsResponse,
  DeleteMessages,
  UpdateEmoji,
  UpdateMessages,
} from '../untills/types';
import { Rooms } from 'src/entities/Rooms';
import { RoomsPromise } from 'src/room/dto/RoomDTO.dto';
import { MessagesRoomsUpdate, MessagesUpdate } from './dto/Messages.dto';
import { GroupRooms } from 'src/entities/Groups';

@Injectable()
export class MessagesService implements IMessageService {
  constructor(
    @InjectModel(Messages.name) private readonly messagesModel: Model<Messages>,
    @InjectModel(Rooms.name) private roomsModel: Model<Rooms>,
    @InjectModel(GroupRooms.name) private groupsModel: Model<GroupRooms>,
  ) {}
  createMessagesForGroup(createMessageParams: CreateMessageGroupParams) {
    // : Promise<CreateMessageRoomsResponse>
    // const { content, groupsID, user } = createMessageParams;
    // const rooms = await this.roomsModel
    //   .findOne({ _id: roomsID })
    //   .populate('creator')
    //   .populate('recipient');
    // if (!rooms) {
    //   throw new HttpException('Room not exist', HttpStatus.BAD_REQUEST);
    // }
    // const { recipient, creator } = rooms;
    // // if (creator.email !== user.email && recipient.email !== user.email) {
    // //   throw new HttpException('Not create Messages', HttpStatus.BAD_REQUEST);
    // // }
    // if (creator.email !== user.email && recipient.email !== user.email) {
    //   throw new HttpException('Not create Messages', HttpStatus.BAD_REQUEST);
    // }
    // const newMessage = await this.messagesModel.create({
    //   content: content,
    //   rooms: rooms,
    //   author: user,
    // });
    // const messageSave = await newMessage.save();
    // const dataMessage = {
    //   _id: messageSave._id,
    //   content: messageSave.content,
    //   emoji: messageSave.emoji,
    //   author: messageSave.author.fullName,
    //   email: messageSave.author.email,
    //   createdAt: new Date(),
    // };
    // const dataAuth = {
    //   email: messageSave.author.email,
    //   fullName: messageSave.author.fullName,
    // };
    // //rooms.lastMessageSent = messageSave;
    // const dataLastMessages = {
    //   _id: messageSave._id,
    //   content: messageSave.content,
    //   emoji: messageSave.emoji,
    //   author: dataAuth,
    //   createdAt: new Date(),
    // };
    // // Cập nhật lại lastMessage vào phòng chat bỏ id messges vào trong đó
    // const updated = await this.roomsModel.findOneAndUpdate(
    //   { _id: rooms.id },
    //   {
    //     $set: { lastMessageSent: dataLastMessages },
    //     $push: { messages: dataMessage },
    //   },
    //   { new: true },
    // );
    // //return messageSave;
    // return { message: messageSave, rooms: updated };
  }
  async iconOnMessages(
    id: string,
    updateEmoji: UpdateEmoji,
  ): Promise<MessagesRoomsUpdate> {
    try {
      const { newEmoji, idMessages, idLastMessageSent, email } = updateEmoji;
      const objectIdMessage = new mongoose.Types.ObjectId(idMessages);
      const findRooms = await this.roomsModel.findById(id);
      if (!findRooms) {
        throw new HttpException('Phòng không tồn tại', HttpStatus.BAD_REQUEST);
      }
      const findMessages = await this.messagesModel.findById(objectIdMessage);
      if (!findMessages) {
        throw new HttpException(
          'Tin nhắn không tồn tại',
          HttpStatus.BAD_REQUEST,
        );
      }
      const updateMessage = await this.messagesModel.updateOne(
        { _id: findMessages.id },
        { emoji: newEmoji },
        { new: true },
      );
      if (updateMessage.modifiedCount <= 0) {
        throw new HttpException(
          'Không thể cập nhật tin nhắn',
          HttpStatus.CONFLICT,
        );
      }
      if (idMessages === idLastMessageSent) {
        const objectIdRoomId = new mongoose.Types.ObjectId(idMessages);
        const dataMessageUpdate = {
          'messages.$.emoji': newEmoji, // Chỉ cập nhật nội dung
          'messages.$.content': findMessages.content,
          'messages.$.updatedAt': new Date(), // Cập nhật thời gian cập nhật
          // Cập nhật thông tin tác giả nếu cần
          'messages.$.email': email,
          'messages.$.author': findMessages.author.fullName,
        };
        const newLastMessages = {
          _id: objectIdRoomId,
          content: findMessages.content,
          emoji: newEmoji,
          author: {
            email: email,
            fullName: findMessages.author.fullName,
          },
          updatedAt: new Date(),
        };
        const updatedRooms = await this.roomsModel.findOneAndUpdate(
          { _id: id, 'messages._id': objectIdMessage }, // Lọc theo id của room và id của tin nhắn trong mảng messages
          { $set: dataMessageUpdate }, // Cập nhật nội dung tin nhắn
          { new: true },
        );
        if (!updatedRooms) {
          throw new HttpException(
            'Không thể cập nhật tin nhắn last',
            HttpStatus.CONFLICT,
          );
        }
        // // Cập nhật lastMessageSent với thông tin từ message cuối cùng hoặc đặt là đối tượng rỗng nếu không còn messages
        const objRoomNew = new mongoose.Types.ObjectId(id);
        const resultLastMessage = await this.roomsModel.findOneAndUpdate(
          { _id: objRoomNew },
          { $set: { lastMessageSent: newLastMessages } },
          { new: true },
        );
        return {
          idMessages: findMessages.id,
          messagesUpdate: findMessages,
          roomsUpdate: resultLastMessage,
        };
      }
      const dataUpdate1 = {
        'messages.$.emoji': newEmoji, // Chỉ cập nhật nội dung
        'messages.$.content': findMessages.content,
        'messages.$.updatedAt': new Date(), // Cập nhật thời gian cập nhật
        // Cập nhật thông tin tác giả nếu cần
        'messages.$.email': email,
        'messages.$.author': findMessages.author.fullName,
      };
      const updatedRooms1 = await this.roomsModel.findOneAndUpdate(
        { _id: id, 'messages._id': objectIdMessage }, // Lọc theo id của room và id của tin nhắn trong mảng messages
        { $set: dataUpdate1 }, // Cập nhật nội dung tin nhắn
        { new: true },
      );
      return {
        idMessages: findMessages.id,
        messagesUpdate: findMessages,
        roomsUpdate: updatedRooms1,
      };
    } catch (error) {
      console.log(error);
    }
  }
  async updateMessage(
    fullName: string,
    id: string,
    informationUpdateMessage: UpdateMessages,
  ) {
    const { newMessages, idMessages, idLastMessageSent, email } =
      informationUpdateMessage;
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

    const updateMessage = await this.messagesModel.updateOne(
      { _id: findMessages.id },
      { content: newMessages },
      { new: true },
    );
    if (!updateMessage) {
      throw new HttpException(
        'Không thể cập nhật tin nhắn',
        HttpStatus.CONFLICT,
      );
    }
    if (findMessages.id === idLastMessageSent) {
      const objectIdRoomId = new mongoose.Types.ObjectId(idMessages);
      const dataMessageUpdate = {
        'messages.$.content': newMessages, // Chỉ cập nhật nội dung
        'messages.$.updatedAt': new Date(), // Cập nhật thời gian cập nhật
        // Cập nhật thông tin tác giả nếu cần
        'messages.$.email': email,
        'messages.$.author': fullName,
      };
      const newLastMessages = {
        _id: objectIdRoomId,
        content: newMessages,
        author: {
          email: email,
          fullName: fullName,
        },
        updatedAt: new Date(),
      };
      const updatedRooms = await this.roomsModel.findOneAndUpdate(
        { _id: id, 'messages._id': findMessages._id }, // Lọc theo id của room và id của tin nhắn trong mảng messages
        { $set: dataMessageUpdate }, // Cập nhật nội dung tin nhắn
        { new: true },
      );
      if (!updatedRooms) {
        throw new HttpException(
          'Không thể cập nhật tin nhắn last',
          HttpStatus.CONFLICT,
        );
      }
      // // Cập nhật lastMessageSent với thông tin từ message cuối cùng hoặc đặt là đối tượng rỗng nếu không còn messages
      const resultLastMessage = await this.roomsModel.findByIdAndUpdate(
        id,
        { $set: { lastMessageSent: newLastMessages } },
        { new: true },
      );
      return resultLastMessage;
    }
    const dataMessageUpdate1 = {
      'messages.$.content': newMessages, // Chỉ cập nhật nội dung
      'messages.$.updatedAt': new Date(), // Cập nhật thời gian cập nhật
      // Cập nhật thông tin tác giả nếu cần
      'messages.$.email': email,
      'messages.$.author': fullName,
    };
    const updatedRooms1 = await this.roomsModel.findOneAndUpdate(
      { _id: id, 'messages._id': findMessages._id }, // Lọc theo id của room và id của tin nhắn trong mảng messages
      { $set: dataMessageUpdate1 }, // Cập nhật nội dung tin nhắn
      { new: true },
    );
    return updatedRooms1;
  }
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
      emoji: messageSave.emoji,
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
      emoji: messageSave.emoji,
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
