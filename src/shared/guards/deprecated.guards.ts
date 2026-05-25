import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CONFIG } from '@shared/constants/config';

@Injectable()
export class DeprecatedGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isDeprecated = this.reflector.get<boolean>(
      CONFIG.DEPRECATED_KEY,
      context.getHandler(),
    );

    if (isDeprecated) {
      throw new ForbiddenException('This endpoint is deprecated.');
    }

    return true;
  }
}
