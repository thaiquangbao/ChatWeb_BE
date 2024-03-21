import { Messages } from 'src/entities/Message';
import { CreateMessageParams, CreateMessageResponse } from 'src/untills/types';

export interface IMessageService {
  createMessages(
    createMessageParams: CreateMessageParams,
  ): Promise<CreateMessageResponse>;
  // createMessages(
  //   createMessageParams: CreateMessageParams,
  // ): Promise<CreateMessageResponse>;
  getMessages(id: string): Promise<Messages[]>;
}
