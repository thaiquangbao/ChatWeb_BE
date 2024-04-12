import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IGroups } from './group';
import { CreateGroupParams, SendFriendInvitations } from 'src/untills/types';
import { UsersPromise } from 'src/auth/dtos/Users.dto';
import { GroupRooms } from 'src/entities/Groups';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/entities/users';
import mongoose, { Model } from 'mongoose';
import { IUserService } from 'src/users/users';
import { Services } from 'src/untills/constain';

@Injectable()
export class GroupRoomsService implements IGroups {
  constructor(
    @InjectModel(User.name) private usersModel: Model<User>,
    @InjectModel(GroupRooms.name) private groupsModel: Model<GroupRooms>,
    @Inject(Services.USERS) private readonly userService: IUserService,
  ) {}
  async inviteToGroups(user: UsersPromise, idRooms: string, id: string) {
    const objectIdGroupId = new mongoose.Types.ObjectId(idRooms);
    const fileGroups = await this.groupsModel.findOne({
      _id: objectIdGroupId,
    });
    if (!fileGroups) {
      throw new HttpException('Not exist Groups', HttpStatus.BAD_REQUEST);
    }
    const objectIdParticipantsId = new mongoose.Types.ObjectId(user.id);
    const fileOwnGroups = await this.groupsModel.findOne({
      _id: fileGroups._id,
      $or: [
        { 'creator._id': objectIdParticipantsId },
        { participants: { $elemMatch: { _id: objectIdParticipantsId } } },
      ],
    });
    if (!fileOwnGroups) {
      throw new HttpException(
        'Bạn không phải thành viên trong nhóm',
        HttpStatus.BAD_REQUEST,
      );
    }
    const objectIdAttenderId = new mongoose.Types.ObjectId(id);
    const fileAttenderGroups = await this.groupsModel.findOne({
      _id: fileGroups._id,
      $or: [
        { 'creator._id': objectIdAttenderId },
        { participants: { $elemMatch: { _id: objectIdAttenderId } } },
      ],
    });
    if (fileAttenderGroups) {
      throw new HttpException('Bạn đã có trong nhóm', HttpStatus.BAD_REQUEST);
    }
    const userAttend = await this.usersModel.findById(objectIdAttenderId);
    const pushParticipants = await this.groupsModel.findByIdAndUpdate(
      fileGroups._id,
      { $push: { participants: userAttend } },
      { new: true },
    );
    return {
      userAttend: userAttend.email,
      userAction: user.email,
      groupsUpdate: pushParticipants,
    };
  }
  async deleteGroups(user: UsersPromise, idRooms: string) {
    const objectIdGroupId = new mongoose.Types.ObjectId(idRooms);
    const fileGroups = await this.groupsModel.findOne({
      _id: objectIdGroupId,
    });
    if (!fileGroups) {
      throw new HttpException('Not exist Groups', HttpStatus.BAD_REQUEST);
    }
    const objectIdCreatorId = new mongoose.Types.ObjectId(user.id);
    const fileOwnGroups = await this.groupsModel.findOne({
      _id: fileGroups._id,
      'creator._id': objectIdCreatorId,
    });
    if (!fileOwnGroups) {
      throw new HttpException('You Not Creator Rooms', HttpStatus.BAD_REQUEST);
    }
    const deleteGroups =
      await this.groupsModel.findByIdAndDelete(objectIdGroupId);
    return deleteGroups;
  }
  async leaveGroups(user: UsersPromise, idRooms: string) {
    const objectIdGroupId = new mongoose.Types.ObjectId(idRooms);
    const fileGroups = await this.groupsModel.findOne({
      _id: objectIdGroupId,
    });
    if (!fileGroups) {
      throw new HttpException('Not exist Groups', HttpStatus.BAD_REQUEST);
    }
    const objectIdParticipantsId = new mongoose.Types.ObjectId(user.id);
    const fileOwnGroups = await this.groupsModel.findOne({
      _id: fileGroups._id,
      'creator._id': objectIdParticipantsId,
    });
    if (fileOwnGroups) {
      throw new HttpException(
        'Bạn là chủ phòng bạn không thể rời đi',
        HttpStatus.BAD_REQUEST,
      );
    }
    const idParticipants = {
      _id: objectIdParticipantsId,
    };
    const pullParticipants = await this.groupsModel.findByIdAndUpdate(
      fileGroups._id,
      { $pull: { participants: idParticipants } },
      { new: true },
    );
    return { userLeave: user.email, groupsUpdate: pullParticipants };
  }
  async getGroupsById(id: string): Promise<GroupRooms> {
    const result = await this.groupsModel.findById(id);
    return result;
  }
  async getGroups(userCreate: UsersPromise): Promise<GroupRooms[]> {
    const objectId = new mongoose.Types.ObjectId(userCreate.id);
    const result = this.groupsModel.find({
      $or: [
        { 'creator._id': userCreate.id },
        { participants: { $elemMatch: { _id: objectId } } },
      ],
    });
    return result;
  }
  async createGroups(
    userCreate: UsersPromise,
    createGroupParams: CreateGroupParams,
  ): Promise<GroupRooms> {
    const usersPromise = createGroupParams.participants.map((phoneNumber) => {
      return this.usersModel.findOne({ phoneNumber: phoneNumber });
    });
    // lộc các giá trị không hợp lệ
    const users = (await Promise.all(usersPromise)).filter((user) => {
      return user;
    });
    const createGroups = await this.groupsModel.create({
      creator: userCreate,
      participants: users,
      nameGroups: createGroupParams.nameGroups,
    });
    const newGroups = await createGroups.save();
    return newGroups;
  }
}
