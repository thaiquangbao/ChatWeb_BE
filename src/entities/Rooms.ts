import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from './users';
import { Messages } from './Message';

@Schema({
  timestamps: true,
})
export class Rooms {
  @Prop({ type: User })
  recipient: User;
  @Prop({ type: User })
  creator: User;
  @Prop({ type: Array })
  messages: Messages[];
  @Prop({ type: Object })
  lastMessageSent: Messages;
}
export const RoomsSchema = SchemaFactory.createForClass(Rooms);
