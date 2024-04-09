import { ArrayMinSize, ArrayNotEmpty, IsString } from 'class-validator';
import { UsersPromise } from 'src/auth/dtos/Users.dto';

export class CreateGroupsDto {
  @ArrayNotEmpty()
  @ArrayMinSize(3)
  @IsString({ each: true })
  participants: string[];
  creator: UsersPromise;
}
