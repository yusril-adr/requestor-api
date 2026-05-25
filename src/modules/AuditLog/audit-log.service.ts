import { Injectable } from '@nestjs/common';
import {
  EntityManager,
  FindManyOptions,
  FindOptionsWhere,
  ILike,
} from 'typeorm';
import { camelCase } from 'typeorm/util/StringUtils';
import { AuditLogRepository } from './audit-log.repository';
import { AuditLogPaginateParamDto } from './dtos/params/audit-log-paginate.param.dto';
import { AuditLogCreateParamDto } from './dtos/params/audit-log-create.param.dto';
import { AuditLogEntityDto } from './dtos/results/audit-log-entity.result.dto';
import { mergeWhereConditions } from '@shared/utils/common';
import { AuditLog } from '@entities/requestor/audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  async create(
    payload: AuditLogCreateParamDto,
    transactionalEntityManager: EntityManager | null,
  ): Promise<AuditLogEntityDto> {
    const auditLogRepository =
      transactionalEntityManager?.getRepository(AuditLog) ??
      this.auditLogRepository;

    const auditLog = auditLogRepository.create(payload);
    const saved = await auditLogRepository.save(auditLog);
    return new AuditLogEntityDto().parseEntity(saved);
  }

  async paginate(
    queryDto: AuditLogPaginateParamDto,
  ): Promise<[AuditLogEntityDto[], number]> {
    let query: FindManyOptions<AuditLog> = {
      order: {
        [camelCase(queryDto.sortBy)]: queryDto.order,
      },
    };

    query = this.searchQuery(query, queryDto);
    query = this.filterQuery(query, queryDto);

    const auditLogs = await this.auditLogRepository.find({
      ...query,
      take: queryDto.perPage,
      skip: queryDto.perPage * (queryDto.page - 1),
    });

    const count = await this.auditLogRepository.count(query);
    return [
      auditLogs.map((al) => new AuditLogEntityDto().parseEntity(al)),
      count,
    ];
  }

  private searchQuery(
    query: FindManyOptions<AuditLog>,
    queryDto: AuditLogPaginateParamDto,
  ): FindManyOptions<AuditLog> {
    if (queryDto.search) {
      const searchCondition: FindOptionsWhere<AuditLog> = {
        actorName: ILike(`%${queryDto.search}%`),
        action: ILike(`%${queryDto.search}%`),
      };
      query.where = mergeWhereConditions(query.where, searchCondition);
    }
    return query;
  }

  private filterQuery(
    query: FindManyOptions<AuditLog>,
    queryDto: AuditLogPaginateParamDto,
  ): FindManyOptions<AuditLog> {
    const filters: (FindOptionsWhere<AuditLog> | null)[] = [
      queryDto.action ? { action: queryDto.action } : null,
      queryDto.targetType ? { targetType: queryDto.targetType } : null,
    ].filter(Boolean);

    query.where = mergeWhereConditions(query.where, ...filters);
    return query;
  }
}
