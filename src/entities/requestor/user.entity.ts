import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

import { RoleKeyEnum } from '../../shared/enums/role.enum';
import { UserStatusEnum } from '@shared/enums/user.enum';

@Entity()
export class User extends BaseEntity {
  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  role: RoleKeyEnum;

  @Column()
  status: UserStatusEnum = UserStatusEnum.ACTIVE;
}

export type TUser = InstanceType<typeof User>;
