import { RoleKeyEnum } from '@shared/enums/role.enum';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class AuthLoginPasswordParamDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsEnum(RoleKeyEnum)
  @IsOptional()
  role: RoleKeyEnum | null = null;
}
