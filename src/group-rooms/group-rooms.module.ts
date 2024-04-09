import { Module } from '@nestjs/common';
import { GroupRoomsController } from './group-rooms.controller';
import { GroupRoomsService } from './group-rooms.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UsersSchema } from 'src/entities/users';
import { Messages, MessagesSchema } from 'src/entities/Message';
import { GroupRooms, GroupRoomsSchema } from 'src/entities/Groups';
import { Services } from 'src/untills/constain';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GroupRooms.name, schema: GroupRoomsSchema },
    ]),
    MongooseModule.forFeature([{ name: User.name, schema: UsersSchema }]),
    MongooseModule.forFeature([
      { name: Messages.name, schema: MessagesSchema },
    ]),
    UsersModule,
  ],
  controllers: [GroupRoomsController],
  providers: [
    {
      provide: Services.GROUPS,
      useClass: GroupRoomsService,
    },
  ],
  exports: [
    {
      provide: Services.GROUPS,
      useClass: GroupRoomsService,
    },
  ],
})
export class GroupRoomsModule {}
