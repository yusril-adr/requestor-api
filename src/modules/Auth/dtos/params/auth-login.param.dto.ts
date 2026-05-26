import { RoleKeyEnum } from '@shared/enums/role.enum';
import { Type } from 'class-transformer';
import {
  IsDefined,
  IsEmail,
  IsEnum,
  IsNotEmptyObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class AuthLoginPasswordParamDto {
  @IsString()
  @IsEmail()
  @IsDefined()
  email: string;

  @IsString()
  @IsDefined()
  password: string;

  @IsString()
  @IsEnum(RoleKeyEnum)
  @IsOptional()
  role: RoleKeyEnum | null = null;

  // @IsDefined()
  // @IsNotEmptyObject()
  // @ValidateNested()
  // @Type(() => B)
  // a: B;
}
