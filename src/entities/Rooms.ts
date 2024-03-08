import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from './users';

@Schema({
  timestamps: true,
})
export class Rooms {
  @Prop({ type: User })
  recipient: User;
  @Prop({ type: User })
  creator: User;
}
export const RoomsSchema = SchemaFactory.createForClass(Rooms);
