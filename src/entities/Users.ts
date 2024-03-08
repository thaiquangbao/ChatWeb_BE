import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ type: String, required: true })
  fullName: string;
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
}
export const UsersSchema = SchemaFactory.createForClass(User);
