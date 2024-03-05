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
