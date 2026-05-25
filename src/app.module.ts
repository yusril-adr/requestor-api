import { join } from 'path';
import { BadRequestException, Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';

import requestorDb from '@infrastructure/databases/requestor.ds';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { AccessTokenGuard } from '@shared/guards/access-token.guards';
import { DeprecatedGuard } from '@shared/guards/deprecated.guards';
import { snakeCase } from 'typeorm/util/StringUtils.js';
import { replaceAllCamelCaseToSnakeCase } from '@shared/utils/common';
import { RequestInterceptor } from '@shared/interceptors/request.interceptor';
import { ResponseInterceptor } from '@shared/interceptors/response.interceptor';
import { GlobalExceptionFilter } from '@shared/filters/global-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: async () => ({
        ...requestorDb.options,
        autoLoadEntities: true,
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/public',
      serveStaticOptions: {
        fallthrough: true,
      },
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
    {
      provide: APP_GUARD,
      useClass: DeprecatedGuard,
    },
    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({
          transform: true,
          exceptionFactory: (errors) => {
            const result = errors.map((error) => ({
              property: snakeCase(error.property),
              message: replaceAllCamelCaseToSnakeCase(
                // @ts-ignore
                error.constraints[Object.keys(error.constraints)[0]],
              ),
            }));
            return new BadRequestException(result);
          },
        }),
    },
    {
      // Convert request keys to CamelCase
      provide: APP_INTERCEPTOR,
      useClass: RequestInterceptor,
    },
    {
      // Convert response keys to snake_case
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
