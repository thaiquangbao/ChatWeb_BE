import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { Services } from 'src/untills/constain';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UsersSchema } from 'src/entities/users';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UsersSchema }]),
  ],
  providers: [
    {
      provide: Services.USERS,
      useClass: UsersService,
    },
  ],
  exports: [
    {
      provide: Services.USERS,
      useClass: UsersService,
    },
  ],
})
export class UsersModule {}
