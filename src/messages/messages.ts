import { Messages } from 'src/entities/Message';
import {
  CreateMessageParams,
  CreateMessageResponse,
  DeleteMessages,
} from 'src/untills/types';
import { RoomAfterDeleteMessages } from './dto/Messages.dto';

export interface IMessageService {
  createMessages(
    createMessageParams: CreateMessageParams,
  ): Promise<CreateMessageResponse>;
  // createMessages(
  //   createMessageParams: CreateMessageParams,
  // ): Promise<CreateMessageResponse>;
  getMessages(id: string): Promise<Messages[]>;
  deleteMessages(id: string, informationMess: DeleteMessages);
  /*  : Promise<RoomAfterDeleteMessages>; */
}
