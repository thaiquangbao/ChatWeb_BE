import { IsNotEmpty, IsString } from 'class-validator';
import { GroupRooms } from 'src/entities/Groups';
import { MessagesGroup } from 'src/entities/MessagesGroup';

export class CreateMessagesGroupsDTO {
  @IsNotEmpty()
  @IsString()
  content: string;
  @IsNotEmpty()
  @IsString()
  groupsID: string;
}
export class GetMessagesGroupDTO {
  groupId: string;
}
export class MessagesGroupsUpdate {
  idMessages: string;
  messagesUpdate: MessagesGroup;
  groupsUpdate: GroupRooms;
}
