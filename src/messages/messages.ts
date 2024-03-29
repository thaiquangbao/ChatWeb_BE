import { Messages } from 'src/entities/Message';
import {
  CreateMessageParams,
  CreateMessageResponse,
  DeleteMessages,
  UpdateMessages,
} from 'src/untills/types';

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
}
