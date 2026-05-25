import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { RequestStatusEnum } from '@shared/enums/request.enum';
import { RequestCreateParamDto } from './request-create.param.dto';

export class RequestUpdateParamDto extends PartialType(RequestCreateParamDto) {
  @IsOptional()
  @IsEnum(RequestStatusEnum)
  status: RequestStatusEnum = RequestStatusEnum.INVITED;
}
