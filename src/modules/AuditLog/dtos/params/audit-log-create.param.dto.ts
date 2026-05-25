import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { AuditLogActionEnum } from '@shared/enums/audit-log.enum';
import { EntityTypeEnum } from '@shared/enums/entity.enum';

export class AuditLogCreateParamDto {
  @IsString()
  @IsNotEmpty()
  actorName: string;

  @IsString()
  @IsNotEmpty()
  action: AuditLogActionEnum | string;

  @IsEnum(EntityTypeEnum)
  targetType: EntityTypeEnum;

  @IsString()
  @IsNotEmpty()
  targetId: string;
}
