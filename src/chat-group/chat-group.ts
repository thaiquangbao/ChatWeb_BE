import { UsersPromise } from 'src/auth/dtos/Users.dto';
import { MessagesGroup } from 'src/entities/MessagesGroup';
import {
  AnswerMessagesGroups,
  CreateMessageGroupParams,
  CreateMessageRoomsResponse,
  DeleteMessages,
  UpdateEmoji,
  UpdateGroupsMessages,
} from 'src/untills/types';
import { MessagesGroupsUpdate } from './dtos/chat-group.dto';

export interface IMessageGroupsService {
  createMessagesForGroup(
    createMessageParams: CreateMessageGroupParams,
  ): Promise<CreateMessageRoomsResponse>;
  getMessagesGroup(id: string): Promise<MessagesGroup[]>;
  deleteMessages(id: string, informationMess: DeleteMessages);
  recallMessage(
    fullName: string,
    id: string,
    informationUpdateMessage: UpdateGroupsMessages,
  );
  feedbackMessages(
    id: string,
    answerMessages: AnswerMessagesGroups,
    user: UsersPromise,
  );
  iconOnMessages(
    id: string,
    updateEmoji: UpdateEmoji,
  ): Promise<MessagesGroupsUpdate>;
}
