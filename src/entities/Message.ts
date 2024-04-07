import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from './users';
import { Rooms } from './Rooms';

@Schema({
  timestamps: true,
})
export class Messages {
  @Prop({ type: String })
  content: string;
  @Prop({ type: User })
  author: User;
  @Prop({ type: Object })
  rooms: Rooms;
  @Prop({ type: String, default: '' })
  emoji: string;
}
export const MessagesSchema = SchemaFactory.createForClass(Messages);
