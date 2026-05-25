import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Roles } from '@shared/decorators/roles.decorator';

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

    const valid = this.matchRoles(
      roles,
      user.roles.map((role) => role.key),
    );

    if (!valid) {
      throw new ForbiddenException(
        'Your role is not allowed to access this endpoint',
      );
    }

    return valid;
  }

  private matchRoles(roles: string[], userRoles: string[]): boolean {
    return roles.some((role) => userRoles.includes(role));
  }
}
