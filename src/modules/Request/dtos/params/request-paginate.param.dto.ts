import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { snakeCase } from 'typeorm/util/StringUtils';
import { Request } from '@entities/requestor/request.entity';
import { PaginateParamDto } from '@shared/dtos/params/paginate.param.dto';
import { getAllEntityProperties } from '@shared/utils/common';
import { RequestStatusEnum, RequestPriorityEnum } from '@shared/enums/request.enum';

export class RequestPaginateParamDto extends PaginateParamDto {
  @IsOptional()
  @IsString()
  @IsIn(getAllEntityProperties(Request).map((prop) => snakeCase(prop)))
  sortBy: string = 'updated_at';

  @IsOptional()
  @IsString()
  @IsEnum(RequestStatusEnum)
  status?: RequestStatusEnum;

  @IsOptional()
  @IsString()
  @IsEnum(RequestPriorityEnum)
  priority?: RequestPriorityEnum;
}
