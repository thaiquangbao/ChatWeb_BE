import { Module } from '@nestjs/common';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { Services } from 'src/untills/constain';
import { UsersModule } from 'src/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Rooms, RoomsSchema } from 'src/entities/Rooms';
import { User, UsersSchema } from 'src/entities/users';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([{ name: Rooms.name, schema: RoomsSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UsersSchema }]),
  ],
  controllers: [RoomController],
  providers: [
    {
      provide: Services.ROOMS,
      useClass: RoomService,
    },
  ],
  exports: [
    {
      provide: Services.ROOMS,
      useClass: RoomService,
    },
  ],
})
export class RoomModule {}
