import { ArrayMinSize, ArrayNotEmpty, IsString } from 'class-validator';
import { UsersPromise } from 'src/auth/dtos/Users.dto';

export class CreateGroupsDto {
  @ArrayNotEmpty()
  @ArrayMinSize(3)
  @IsString({ each: true })
  participants: string[];
  creator: UsersPromise;
  nameGroups?: string;
  avtGroups?: string;
}
export class InvitedGroupsDto {
  participants: string[];
  groupId: string;
}
export class UpdateGroupsRooms {
  idGroups: string;
  nameGroups?: string;
  avtGroups?: string;
}
export class KickUser {
  idGroups: string;
  idUserKick: string;
}
