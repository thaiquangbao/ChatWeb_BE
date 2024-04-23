import { Messages } from 'src/entities/Message';
import {
  AnswerMessagesSingle,
  CreateMessageParams,
  CreateMessageResponse,
  DeleteMessages,
  UpdateEmoji,
  UpdateMessages,
} from 'src/untills/types';
import { MessagesRoomsUpdate } from './dto/Messages.dto';
import { UsersPromise } from 'src/auth/dtos/Users.dto';

export interface IMessageService {
  createMessages(
    createMessageParams: CreateMessageParams,
  ): Promise<CreateMessageResponse>;
  getMessages(id: string): Promise<Messages[]>;
  deleteMessages(id: string, informationMess: DeleteMessages);
  updateMessage(
    fullName: string,
    id: string,
    informationUpdateMessage: UpdateMessages,
  );
  iconOnMessages(
    id: string,
    updateEmoji: UpdateEmoji,
  ): Promise<MessagesRoomsUpdate>;
  feedbackMessagesSingle(
    id: string,
    answerMessages: AnswerMessagesSingle,
    user: UsersPromise,
  );
}
