import { IsEnum, IsDefined, IsString } from 'class-validator';
import { AuditLogActionEnum } from '@shared/enums/audit-log.enum';
import { EntityTypeEnum } from '@shared/enums/entity.enum';

export class AuditLogCreateParamDto {
  @IsString()
  @IsDefined()
  actorName: string;

  @IsString()
  @IsDefined()
  action: AuditLogActionEnum | string;

  @IsEnum(EntityTypeEnum)
  targetType: EntityTypeEnum;

  @IsString()
  @IsDefined()
  targetId: string;
}
