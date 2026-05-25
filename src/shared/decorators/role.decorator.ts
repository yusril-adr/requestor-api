import { Reflector } from '@nestjs/core';
import { RoleKeyEnum } from '@shared/enums/role.enum';

export const Roles = Reflector.createDecorator<RoleKeyEnum[]>();
