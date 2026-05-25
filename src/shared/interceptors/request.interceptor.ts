import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { snakeToCamel } from '@shared/utils/common';

@Injectable()
export class RequestInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    if (request.body) {
      request.body = snakeToCamel(request.body);
    }

    if (request.query) {
      request.query = snakeToCamel(request.query);
    }

    return next.handle();
  }
}
