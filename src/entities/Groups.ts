import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from './users';
import { Messages } from './Message';
@Schema({
  timestamps: true,
})
export class GroupRooms {
  @Prop({ type: String, default: '' })
  nameGroups: string;
  @Prop({ type: Array })
  participants: User[];
  @Prop({ type: User })
  creator: User;
  @Prop({ type: Array, default: () => [] })
  messages: Messages[];
  @Prop({ type: Object, default: '' })
  lastMessageSent: Messages;
  @Prop({ type: String, default: '' })
  avtGroups: string;
}
export const GroupRoomsSchema = SchemaFactory.createForClass(GroupRooms);
