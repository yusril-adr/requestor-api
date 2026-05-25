import 'reflect-metadata';
import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { SeederOptions } from 'typeorm-extension';

import { SnakeCaseNamingStrategy } from '@shared/strategies/snake-case-naming.strategy';
import { User } from '@entities/requestor/user.entity';
import { Request } from '@entities/requestor/request.entity';
import { AuditLog } from '@entities/requestor/audit-log.entity';
import UserSeeder from '../../../seeders/requestor/user.seed';
import RequestSeeder from '../../../seeders/requestor/request.seed';

// Load .env file
config();

const configService = new ConfigService();

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: configService.get<string>('REQUESTOR_DB_HOST'),
  port: configService.get<number>('REQUESTOR_DB_PORT'),
  username: configService.get<string>('REQUESTOR_DB_USERNAME'),
  password: configService.get<string>('REQUESTOR_DB_PASSWORD'),
  database: configService.get<string>('REQUESTOR_DB_DATABASE'),
  entities: [User, Request, AuditLog],
  migrations: [join(__dirname, '../../../', 'migrations/requestor', '*.ts')],
  // seeds: [join(__dirname, '../../../', 'seeders', '*.seeder.ts')],
  seeds: [UserSeeder, RequestSeeder],
  factories: [join(__dirname, '../../../', 'factories', '*.factory.ts')],
  poolSize: configService.get<number>('REQUESTOR_DB_POOL_SIZE'),
  connectTimeoutMS: configService.get<number>(
    'REQUESTOR_DB_CONNECT_TIMEOUT_IN_MS',
  ),
  synchronize: false,
  extra: {
    charset: 'utf8mb4_unicode_ci',
  },
  migrationsTableName: 'typeorm_migration',
  namingStrategy: new SnakeCaseNamingStrategy(),
};

export default new DataSource(options);
