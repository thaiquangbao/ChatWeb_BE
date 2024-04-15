import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IGroups } from './group';
import { CreateGroupParams, KickGroups, UpdateGroups } from 'src/untills/types';
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
  async kickGroups(userAction: UsersPromise, kickGroups: KickGroups) {
    const { idGroups, idUserKick } = kickGroups;
    const objectIdGroupId = new mongoose.Types.ObjectId(idGroups);
    const existGroups = await this.groupsModel.findById(objectIdGroupId);
    if (!existGroups) {
      throw new HttpException('Groups not exist', HttpStatus.BAD_REQUEST);
    }
    const objectIdCreatorId = new mongoose.Types.ObjectId(userAction.id);
    const fileOwnGroups = await this.groupsModel.findOne({
      _id: existGroups._id,
      'creator._id': objectIdCreatorId,
    });
    if (!fileOwnGroups) {
      throw new HttpException('You Not Creator Rooms', HttpStatus.BAD_REQUEST);
    }
    const objectIdAttendId = new mongoose.Types.ObjectId(idUserKick);
    const findAttendGroups = await this.groupsModel.findOne({
      _id: existGroups._id,
      participants: { $elemMatch: { _id: objectIdAttendId } },
    });
    if (!findAttendGroups) {
      throw new HttpException('User is not in Groups', HttpStatus.BAD_REQUEST);
    }
    const userKicked = {
      _id: objectIdAttendId,
    };
    const pullParticipants = await this.groupsModel.findByIdAndUpdate(
      existGroups._id,
      { $pull: { participants: userKicked } },
      { new: true },
    );
    const findUserKick = await this.usersModel.findById(objectIdAttendId);
    return {
      userAction: userAction.email,
      userKicked: findUserKick.email,
      groupsUpdate: pullParticipants,
    };
  }
  async updateGroups(
    user: UsersPromise,
    updateGroups: UpdateGroups,
  ): Promise<GroupRooms> {
    const { idGroups, nameGroups, avtGroups } = updateGroups;
    const objectIdGroupId = new mongoose.Types.ObjectId(idGroups);
    const existGroups = await this.groupsModel.findById(objectIdGroupId);
    if (!existGroups) {
      throw new HttpException('Groups not exist', HttpStatus.BAD_REQUEST);
    }
    const objectIdUserAction = new mongoose.Types.ObjectId(user.id);
    const fileOwnGroups = await this.groupsModel.findOne({
      _id: existGroups._id,
      $or: [
        { 'creator._id': objectIdUserAction },
        { participants: { $elemMatch: { _id: objectIdUserAction } } },
      ],
    });
    if (!fileOwnGroups) {
      throw new HttpException(
        'Bạn không phải thành viên trong nhóm',
        HttpStatus.BAD_REQUEST,
      );
    }
    const updateGroupsUser = await this.groupsModel.updateOne(
      { _id: existGroups._id },
      { nameGroups: nameGroups, avtGroups: avtGroups },
      { new: true },
    );
    if (updateGroupsUser.modifiedCount <= 0) {
      throw new HttpException('Không thể cập nhật Groups', HttpStatus.CONFLICT);
    }
    const result = await this.groupsModel.findById(existGroups._id);
    return result;
  }
  async inviteToGroups(
    user: UsersPromise,
    idRooms: string,
    participants: string[],
  ) {
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
    const userAttendGroups = participants.map((phoneNumber) => {
      return this.usersModel.findOne({ phoneNumber: phoneNumber });
    });
    const usersPromise = (await Promise.all(userAttendGroups)).filter(
      (user) => {
        return user;
      },
    );
    const pushParticipants = await this.groupsModel.findByIdAndUpdate(
      fileGroups._id,
      { $push: { participants: { $each: usersPromise } } },
      { new: true },
    );
    return {
      userAttends: usersPromise,
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
      avtGroups:
        'https://www.pngall.com/wp-content/uploads/9/Society-PNG-Pic.png',
    });
    const newGroups = await createGroups.save();
    return newGroups;
  }
}
