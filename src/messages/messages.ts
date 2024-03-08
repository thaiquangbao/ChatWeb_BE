import { Messages } from 'src/entities/Message';
import { CreateMessageParams } from 'src/untills/types';

export interface IMessageService {
  createMessages(createMessageParams: CreateMessageParams): Promise<Messages>;
  // createMessages(
  //   createMessageParams: CreateMessageParams,
  // ): Promise<CreateMessageResponse>;
  getMessages(id: string): Promise<Messages[]>;
}
