import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Roles } from '@shared/decorators/role.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    public readonly configService: ConfigService,
    private reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get(Roles, context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log({ user, roles });

    const valid = roles.includes(user.role);

    if (!valid) {
      throw new ForbiddenException(
        'Your role is not allowed to access this endpoint',
      );
    }

    return valid;
  }
}
