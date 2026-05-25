import { RoleKeyEnum } from '@shared/enums/role.enum';

export type TJWTPayload = {
  id: string;
  role: RoleKeyEnum;
};
