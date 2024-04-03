import { Module } from '@nestjs/common';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import { Services } from 'src/untills/constain';
import { MongooseModule } from '@nestjs/mongoose';
import { Rooms, RoomsSchema } from 'src/entities/Rooms';
import { User, UsersSchema } from 'src/entities/users';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Rooms.name, schema: RoomsSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UsersSchema }]),
  ],
  controllers: [FriendsController],
  providers: [
    {
      provide: Services.FRIENDS,
      useClass: FriendsService,
    },
  ],
  exports: [
    {
      provide: Services.FRIENDS,
      useClass: FriendsService,
    },
  ],
})
export class FriendsModule {}
