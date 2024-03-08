import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateUsers {
  @IsString()
  @MaxLength(40)
  @IsNotEmpty()
  fullName: string;
  @IsString()
  @IsNotEmpty()
  dateOfBirth: string;
  @IsPhoneNumber()
  @IsNotEmpty()
  phoneNumber: string;
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  passWord: string;
  @IsString()
  @IsNotEmpty()
  avatar: string;
}
export class CheckUsers {
  id: string;
  @IsString()
  @MaxLength(40)
  @IsNotEmpty()
  fullName: string;
  @IsString()
  @IsNotEmpty()
  dateOfBirth: string;
  @IsPhoneNumber()
  @IsNotEmpty()
  phoneNumber: string;
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  passWord: string;
  @IsString()
  @IsNotEmpty()
  avatar: string;
}
export class ValidAccount {
  fullName: string;
  phoneNumber: string;
  email: string;
  passWord: string;
  dateOfBirth: string;
  avatar: string;
  code: string;
}
export class UsersPromise {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  passWord: string;
  dateOfBirth: string;
  avatar: string;
}
