import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import {
  RequestStatusEnum,
  RequestPriorityEnum,
} from '@shared/enums/request.enum';

export class RequestCreateParamDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  requestorName: string;

  @IsEnum(RequestPriorityEnum)
  priority: RequestPriorityEnum;

  @IsOptional()
  @IsString()
  assigneeName?: string | null;
}
