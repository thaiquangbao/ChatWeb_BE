import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';
import { Messages } from './Message';

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ type: String, required: true })
  fullName: string;
  // @Prop({ type: String })
  // male: string;
  // @Prop({ type: String })
  // backGroud: string;
  @Prop({ type: String, required: true })
  phoneNumber: string;
  @Prop({ type: String, required: true })
  email: string;
  @Prop({ type: String, required: true })
  @Exclude() // mật khảu sẻ k hiển thị trên màn hình
  passWord: string;
  @Prop({ type: String, required: true })
  dateOfBirth: string;
  @Prop({ type: String, required: true })
  avatar: string;
  @Prop({ type: Array })
  messages: Messages[];
}
export const UsersSchema = SchemaFactory.createForClass(User);
