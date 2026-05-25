import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';
import {
  RequestStatusEnum,
  RequestPriorityEnum,
} from '@shared/enums/request.enum';

@Entity()
export class Request extends BaseEntity {
  @Column()
  title: string;

  @Column()
  requestorName: string;

  @Column()
  status: RequestStatusEnum = RequestStatusEnum.INVITED;

  @Column()
  priority: RequestPriorityEnum;

  @Column({ type: 'varchar', nullable: true })
  assigneeName?: string | null;
}

export type TRequest = InstanceType<typeof Request>;
