import { IsEnum, IsDefined, IsOptional, IsString } from 'class-validator';
import { RequestPriorityEnum } from '@shared/enums/request.enum';

export class RequestCreateParamDto {
  @IsString()
  @IsDefined()
  title: string;

  @IsString()
  @IsDefined()
  requestorName: string;

  @IsDefined()
  @IsEnum(RequestPriorityEnum)
  priority: RequestPriorityEnum = RequestPriorityEnum.LOW;

  @IsOptional()
  @IsString()
  assigneeName?: string | null;
}
