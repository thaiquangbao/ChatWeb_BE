import { Module } from '@nestjs/common';
import { ChatGroupController } from './chat-group.controller';
import { ChatGroupService } from './chat-group.service';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupRooms, GroupRoomsSchema } from 'src/entities/Groups';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { Services } from 'src/untills/constain';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CloudinaryProvider } from 'src/cloudinary/cloudinary.provider';
import { MessagesGroup, MessagesGroupSchema } from 'src/entities/MessagesGroup';
import { Messages, MessagesSchema } from 'src/entities/Message';
import { Rooms, RoomsSchema } from 'src/entities/Rooms';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GroupRooms.name, schema: GroupRoomsSchema },
    ]),
    MongooseModule.forFeature([
      { name: MessagesGroup.name, schema: MessagesGroupSchema },
    ]),
    MongooseModule.forFeature([
      { name: Messages.name, schema: MessagesSchema },
    ]),
    MongooseModule.forFeature([{ name: Rooms.name, schema: RoomsSchema }]),
    CloudinaryModule,
  ],
  controllers: [ChatGroupController],
  providers: [
    {
      provide: Services.CHATGROUPS,
      useClass: ChatGroupService,
    },
    CloudinaryService,
    CloudinaryProvider,
  ],
  exports: [
    {
      provide: Services.CHATGROUPS,
      useClass: ChatGroupService,
    },
  ],
})
export class ChatGroupModule { }
