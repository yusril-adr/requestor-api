import { PartialType } from '@nestjs/mapped-types';
import { UserCreateParamDto } from './user-create.param.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { UserStatusEnum } from '@shared/enums/user.enum';

export class UserUpdateParamDto extends PartialType(UserCreateParamDto) {
  @IsOptional()
  @IsEnum(UserStatusEnum)
  status: UserStatusEnum = UserStatusEnum.ACTIVE;
}
