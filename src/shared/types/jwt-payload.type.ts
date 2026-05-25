import { RoleKeyEnum } from '@shared/enums/role.enum';

export type TJWTPayload = {
  id: string;
  name: string;
  email: string;
  role: RoleKeyEnum;
};
