import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { snakeCase } from 'typeorm/util/StringUtils';
import { AuditLog } from '@entities/requestor/audit-log.entity';
import { PaginateParamDto } from '@shared/dtos/params/paginate.param.dto';
import { getAllEntityProperties } from '@shared/utils/common';
import { AuditLogActionEnum } from '@shared/enums/audit-log.enum';
import { EntityTypeEnum } from '@shared/enums/entity.enum';

export class AuditLogPaginateParamDto extends PaginateParamDto {
  @IsOptional()
  @IsString()
  @IsIn(getAllEntityProperties(AuditLog).map((prop) => snakeCase(prop)))
  sortBy: string = 'created_at';

  @IsOptional()
  @IsString()
  @IsEnum(AuditLogActionEnum)
  action?: AuditLogActionEnum;

  @IsOptional()
  @IsString()
  @IsEnum(EntityTypeEnum)
  targetType?: EntityTypeEnum;
}
