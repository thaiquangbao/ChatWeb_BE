import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IFriendsService } from './friends';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/entities/users';
import mongoose, { Model } from 'mongoose';
import { SendFriendDto } from './dto/friendDto';
import { Rooms } from 'src/entities/Rooms';
import { Services } from 'src/untills/constain';
import { IRoomsService } from 'src/room/room';

@Injectable()
export class FriendsService implements IFriendsService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Rooms.name) private readonly roomsModel: Model<Rooms>,
    @Inject(Services.ROOMS) private readonly roomsService: IRoomsService,
  ) {}
  async acceptFriends(
    idSender: string,
    myId: string,
    idRooms: string,
  ): Promise<SendFriendDto> {
    const objectIdRoomId1 = new mongoose.Types.ObjectId(myId);
    const objectIdRoomId2 = new mongoose.Types.ObjectId(idSender);
    const userAccept = await this.userModel.findById(objectIdRoomId1);
    const sender = await this.userModel.findById(objectIdRoomId2);
    if (!userAccept) {
      throw new HttpException('User not exist', HttpStatus.NOT_FOUND);
    }
    if (!sender) {
      throw new HttpException(
        'Không tồn tại người gửi này',
        HttpStatus.NOT_FOUND,
      );
    }
    const existWait = await this.userModel
      .find({
        _id: userAccept._id,
        waitAccept: { $elemMatch: { _id: sender._id } },
      })
      .exec();
    const existSender = await this.userModel
      .find({
        _id: sender._id,
        sendFriend: { $elemMatch: { _id: userAccept._id } },
      })
      .exec();
    if (existWait.length <= 0) {
      throw new HttpException(
        'Không có lời mời kết bạn từ User này',
        HttpStatus.NOT_FOUND,
      );
    }
    if (existSender.length <= 0) {
      throw new HttpException(
        'Người này không gửi lời mời kết bạn nào cho bạn',
        HttpStatus.NOT_FOUND,
      );
    }
    const findFriendsExist = await this.userModel.find({
      _id: sender._id,
      friends: {
        $elemMatch: { _id: userAccept._id },
      },
    });
    const findFriendsExistRecieve = await this.userModel.find({
      _id: userAccept._id,
      friends: {
        $elemMatch: { _id: sender._id },
      },
    });
    if (findFriendsExist.length > 0 || findFriendsExistRecieve.length > 0) {
      throw new HttpException('2 người đã là bạn', HttpStatus.BAD_REQUEST);
    }
    const pushSender = {
      _id: sender._id,
      fullName: sender.fullName,
      gender: sender.gender,
      background: sender.background,
      phoneNumber: sender.phoneNumber,
      email: sender.email,
      dateOfBirth: sender.dateOfBirth,
      avatar: sender.avatar,
      sended: true,
    };
    const pushWaiter = {
      _id: userAccept._id,
      fullName: userAccept.fullName,
      gender: userAccept.gender,
      background: userAccept.background,
      phoneNumber: userAccept.phoneNumber,
      email: userAccept.email,
      dateOfBirth: userAccept.dateOfBirth,
      avatar: userAccept.avatar,
      sended: true,
    };
    const idSenderPull = {
      _id: objectIdRoomId2,
    };
    const idWaitPull = {
      _id: objectIdRoomId1,
    };
    const pushFriendsWaiter = await this.userModel.findOneAndUpdate(
      { _id: objectIdRoomId1 },
      {
        $push: { friends: pushSender },
        $pull: { waitAccept: idSenderPull },
      },
      { new: true },
    );
    const pushFriendsSender = await this.userModel.findOneAndUpdate(
      { _id: objectIdRoomId2 },
      {
        $push: { friends: pushWaiter },
        $pull: { sendFriend: idWaitPull },
      },
      { new: true },
    );
    const objectIdRoomId3 = new mongoose.Types.ObjectId(idRooms);
    // console.log(objectIdRoomId3);
    const updateRoom = await this.roomsModel.findOneAndUpdate(
      {
        _id: objectIdRoomId3,
      },
      { 'creator.sended': true, 'recipient.sended': true, friend: true },
    );
    console.log(updateRoom);
    return { userSend: pushFriendsSender, userAccept: pushFriendsWaiter };
  }
  async sendFriendInvitations(
    id: string,
    myId: string,
  ): Promise<SendFriendDto> {
    const objectIdRoomId1 = new mongoose.Types.ObjectId(myId);
    const userSend = await this.userModel.findById(objectIdRoomId1);
    if (!userSend) {
      throw new HttpException('User not exist', HttpStatus.NOT_FOUND);
    }
    const objectIdRoomId2 = new mongoose.Types.ObjectId(id);
    const userReceived = await this.userModel.findById(objectIdRoomId2);
    if (!userReceived) {
      throw new HttpException('Recipient not exist', HttpStatus.NOT_FOUND);
    }
    if (userSend.id === userReceived.id) {
      throw new HttpException(
        'Không thể kết bạn với chính mình',
        HttpStatus.BAD_REQUEST,
      );
    }
    const findWaitExist = await this.userModel
      .find({
        _id: userReceived._id,
        $or: [
          { waitAccept: { $elemMatch: { _id: userSend._id } } },
          { sendFriend: { $elemMatch: { _id: userSend._id } } },
        ],
      })
      .exec();
    const findSendFriendExist = await this.userModel
      .find({
        _id: userSend._id,
        $or: [
          { waitAccept: { $elemMatch: { _id: userReceived._id } } },
          { sendFriend: { $elemMatch: { _id: userReceived._id } } },
        ],
      })
      .exec();
    const findFriendsExist = await this.userModel.find({
      _id: userSend._id,
      friends: {
        $elemMatch: { _id: userReceived._id },
      },
    });
    const findFriendsExistRecieve = await this.userModel.find({
      _id: userReceived._id,
      friends: {
        $elemMatch: { _id: userSend._id },
      },
    });
    if (findWaitExist.length > 0) {
      throw new HttpException(
        'Người này đang chờ bạn đồng ý hoặc bạn đã gửi lời mời kết bạn cho người này ròi',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (findSendFriendExist.length > 0) {
      throw new HttpException(
        'Người này đang chờ bạn đồng ý hoặc bạn đã gửi lời mời kết bạn cho người này ròi',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (findFriendsExist.length > 0 || findFriendsExistRecieve.length > 0) {
      throw new HttpException('2 người đã là bạn', HttpStatus.BAD_REQUEST);
    }
    const pushSendAccept = {
      _id: userSend._id,
      fullName: userSend.fullName,
      gender: userSend.gender,
      background: userSend.background,
      phoneNumber: userSend.phoneNumber,
      email: userSend.email,
      dateOfBirth: userSend.dateOfBirth,
      avatar: userSend.avatar,
      sended: userSend.sended,
    };
    const pushWaitAccept = {
      _id: userReceived._id,
      fullName: userReceived.fullName,
      gender: userReceived.gender,
      background: userReceived.background,
      phoneNumber: userReceived.phoneNumber,
      email: userReceived.email,
      dateOfBirth: userReceived.dateOfBirth,
      avatar: userReceived.avatar,
      sended: true,
    };
    const sender = await this.userModel.findOneAndUpdate(
      { _id: userSend._id },
      { $push: { sendFriend: pushWaitAccept } },
      { new: true },
    );
    const waiter = await this.userModel.findOneAndUpdate(
      { _id: userReceived._id },
      { $push: { waitAccept: pushSendAccept } },
      { new: true },
    );
    return { userSend: sender, userAccept: waiter };
  }
}
