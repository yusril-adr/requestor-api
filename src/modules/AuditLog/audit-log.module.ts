import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '@entities/requestor/audit-log.entity';
import { AuditLogRepository } from './audit-log.repository';
import { AuditLogService } from './audit-log.service';
import { AuditLogController } from './audit-log.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  controllers: [AuditLogController],
  providers: [AuditLogRepository, AuditLogService],
  exports: [AuditLogRepository, AuditLogService],
})
export class AuditLogModule {}
