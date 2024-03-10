import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as session from 'express-session';
import * as passport from 'passport';
import * as cookieParser from 'cookie-parser';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const { PORT } = process.env;
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({ origin: ['http://localhost:3000'], credentials: true });
  app.use(cookieParser());
  app.use(
    session({
      name: 'Session_JS',
      secret: process.env.SESSION_SECURITY,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 3600000,
        path: '/',
      },
    }),
  );
  app.use(passport.initialize()); // xác thực người dùng
  app.use(passport.session());
  try {
    await app.listen(PORT, () => console.log(`Running port: ${PORT}`));
  } catch (error) {
    console.log(error);
  }
}
bootstrap();
