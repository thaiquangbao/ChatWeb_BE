import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailerService } from './mailer/mailer.service';
import { MiddlewareService } from './middleware/middleware.service';
import { RoomModule } from './room/room.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MessagesModule } from './messages/messages.module';
import { GatewayModule } from './gateway/gateway.module';
// PassportModule.register({ defaultStrategy: "jwt" }),
@Module({
  imports: [
    AuthModule,
    UsersModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    PassportModule.register({ session: true, defaultStrategy: 'jwt' }),
    MongooseModule.forRoot(process.env.MONGODB),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          secret: config.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: config.get<string | number>('JWT_EXPIRES'),
          },
        };
      },
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        secure: false,
        auth: {
          user: process.env.USERMAILER,
          pass: process.env.PASSWORDMAILER,
        },
      },
    }),
    RoomModule,
    EventEmitterModule.forRoot(),
    MessagesModule,
    GatewayModule,
  ],
  controllers: [],
  providers: [MailerService, MiddlewareService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MiddlewareService).forRoutes({
      path: '/auth/sendMail',
      method: RequestMethod.POST,
    });
  }
}
