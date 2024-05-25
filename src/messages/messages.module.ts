import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Messages, MessagesSchema } from 'src/entities/Message';
import { Services } from '../untills/constain';
import { Rooms, RoomsSchema } from 'src/entities/Rooms';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CloudinaryProvider } from 'src/cloudinary/cloudinary.provider';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { GroupRooms, GroupRoomsSchema } from 'src/entities/Groups';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Rooms.name, schema: RoomsSchema }]),
    MongooseModule.forFeature([
      { name: Messages.name, schema: MessagesSchema },
    ]),
    MongooseModule.forFeature([
      { name: GroupRooms.name, schema: GroupRoomsSchema },
    ]),
    CloudinaryModule,
  ],
  providers: [
    {
      provide: Services.MESSAGES,
      useClass: MessagesService,
    },
    CloudinaryService,
    CloudinaryProvider,
  ],
  exports: [
    {
      provide: Services.MESSAGES,
      useClass: MessagesService,
    },
  ],
  controllers: [MessagesController],
})
export class MessagesModule { }
