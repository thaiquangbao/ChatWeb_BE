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
