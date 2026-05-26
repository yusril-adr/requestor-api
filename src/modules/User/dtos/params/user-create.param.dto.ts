import {
  IsEmail,
  IsEnum,
  IsDefined,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { RoleKeyEnum } from '@shared/enums/role.enum';

export class UserCreateParamDto {
  @IsString()
  @IsDefined()
  name: string;

  @IsString()
  @IsDefined()
  @IsEmail()
  email: string;

  @IsString()
  @IsDefined()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsEnum(RoleKeyEnum)
  role: RoleKeyEnum = RoleKeyEnum.OPERATOR;
}
