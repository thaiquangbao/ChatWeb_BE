import { UsersPromise } from 'src/auth/dtos/Users.dto';

export type CreateUserDetails = {
  fullName: string;
  phoneNumber: string;
  email: string;
  passWord: string;
  dateOfBirth: string;
  avatar: string;
};
export type ValidateUserDetails = {
  email: string;
  passWord: string;
};
export type FindUserByEmail = Partial<{
  id: string;
  email: string;
}>;
export type ValidateUser = {
  email: string;
};
export type ValidCode = {
  fullName: string;
  phoneNumber: string;
  email: string;
  passWord: string;
  dateOfBirth: string;
  avatar: string;
  code: string;
};

export type CreateRoomsParams = {
  email: string;
  message: string;
};
export type AccessParams = {
  id: string;
  userId: string;
};
export type GetConversationMessagesParams = {
  id: string;
  limit: number;
};
export interface AuthenticatedRequest extends Request {
  user: UsersPromise;
}
export type RoomsIdentityType = 'authors' | 'recipient';
