import type { TAuditLog } from '@entities/requestor/audit-log.entity';
import { AuditLogActionEnum } from '@shared/enums/audit-log.enum';
import { EntityTypeEnum } from '@shared/enums/entity.enum';
import dayjs from '@shared/utils/dayjs';

export type TAuditLogEntityDto = Omit<
  TAuditLog,
  'createdAt' | 'updatedAt'
> & {
  createdAt: string | Date;
  updatedAt: string | Date;
};

export class AuditLogEntityDto implements TAuditLogEntityDto {
  id: string;
  actorName: string;
  action: AuditLogActionEnum | string;
  targetType: EntityTypeEnum;
  targetId: string;
  createdAt: string;
  updatedAt: string;

  parseEntity({
    id,
    actorName,
    action,
    targetType,
    targetId,
    createdAt,
    updatedAt,
  }: TAuditLogEntityDto): AuditLogEntityDto {
    this.id = id;
    this.actorName = actorName;
    this.action = action;
    this.targetType = targetType;
    this.targetId = targetId;
    this.createdAt = dayjs(createdAt).toISOString();
    this.updatedAt = dayjs(updatedAt).toISOString();

    return this;
  }
}
