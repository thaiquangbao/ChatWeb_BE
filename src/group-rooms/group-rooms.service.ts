import { Inject, Injectable } from '@nestjs/common';
import { IGroups } from './group';
import { CreateGroupParams, FetchGroupParams } from 'src/untills/types';
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
    const usersPromise = createGroupParams.participants.map((email) => {
      return this.userService.findOneUsers({ email });
    });
    // lộc các giá trị không hợp lệ
    const users = (await Promise.all(usersPromise)).filter((user) => {
      return user;
    });
    const createGroups = await this.groupsModel.create({
      creator: userCreate,
      participants: users,
    });
    const newGroups = await createGroups.save();
    await this.usersModel.findOneAndUpdate(
      { email: userCreate.email },
      { $push: { groupRooms: newGroups } },
      { new: true },
    );
    return newGroups;
  }
}
