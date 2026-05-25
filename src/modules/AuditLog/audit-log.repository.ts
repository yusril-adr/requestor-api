import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AuditLog } from '@entities/requestor/audit-log.entity';

@Injectable()
export class AuditLogRepository extends Repository<AuditLog> {
  constructor(private readonly dataSource: DataSource) {
    super(AuditLog, dataSource.createEntityManager());
  }

  async findAndValidateAuditLogByIds(auditLogIds: string[]): Promise<AuditLog[]> {
    const auditLogDatas = await this.find({
      where: auditLogIds.map((id) => ({ id })),
    });
    const notFoundIds = auditLogIds.filter(
      (id) => !auditLogDatas.map((al) => al.id).includes(id),
    );

    if (notFoundIds.length) {
      throw new NotFoundException(`AuditLog with id ${notFoundIds} not found`);
    }

    return auditLogDatas;
  }
}
