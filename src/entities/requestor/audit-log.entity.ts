import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';
import { EntityTypeEnum } from '@shared/enums/entity.enum';
import { AuditLogActionEnum } from '@shared/enums/audit-log.enum';

@Entity()
export class AuditLog extends BaseEntity {
  @Column()
  actorName: string;

  @Column()
  action: AuditLogActionEnum | string;

  @Column()
  targetType: EntityTypeEnum;

  @Column()
  targetId: string;
}

export type TAuditLog = InstanceType<typeof AuditLog>;
