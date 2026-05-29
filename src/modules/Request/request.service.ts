import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, FindManyOptions, FindOptionsWhere, ILike } from 'typeorm';
import { camelCase } from 'typeorm/util/StringUtils';
import { RequestRepository } from './request.repository';
import { RequestPaginateParamDto } from './dtos/params/request-paginate.param.dto';
import { RequestCreateParamDto } from './dtos/params/request-create.param.dto';
import { RequestUpdateParamDto } from './dtos/params/request-update.param.dto';
import { RequestEntityDto } from './dtos/results/request-entity.result.dto';
import { mergeWhereConditions } from '@shared/utils/common';
import { Request } from '@entities/requestor/request.entity';
import { TJWTPayload } from '@shared/types/jwt-payload.type';
import { AuditLogService } from '@modules/AuditLog/audit-log.service';
import { AuditLogActionEnum } from '@shared/enums/audit-log.enum';
import { EntityTypeEnum } from '@shared/enums/entity.enum';

@Injectable()
export class RequestService {
  constructor(
    private readonly requestRepository: RequestRepository,
    private readonly auditLogService: AuditLogService,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    payload: RequestCreateParamDto,
    user: TJWTPayload,
  ): Promise<RequestEntityDto> {
    const saved = await this.dataSource.transaction(async (manager) => {
      const requestRepo = manager.getRepository(Request);
      const requestEntity = requestRepo.create(payload);
      const result = await requestRepo.save(requestEntity);

      await this.auditLogService.create(
        {
          actorName: user.name,
          action: AuditLogActionEnum.CREATE,
          targetType: EntityTypeEnum.REQUEST,
          targetId: result.id,
        },
        manager,
      );

      return result;
    });

    return new RequestEntityDto().parseEntity(saved);
  }

  async paginate(
    queryDto: RequestPaginateParamDto,
  ): Promise<[RequestEntityDto[], number]> {
    let query: FindManyOptions<Request> = {
      order: {
        [camelCase(queryDto.sortBy)]: queryDto.order,
      },
    };

    query = this.searchQuery(query, queryDto);
    query = this.filterQuery(query, queryDto);

    const requests = await this.requestRepository.find({
      ...query,
      take: queryDto.perPage,
      skip: queryDto.perPage * (queryDto.page - 1),
    });

    const count = await this.requestRepository.count(query);
    return [
      requests.map((req) => new RequestEntityDto().parseEntity(req)),
      count,
    ];
  }

  private searchQuery(
    query: FindManyOptions<Request>,
    queryDto: RequestPaginateParamDto,
  ): FindManyOptions<Request> {
    if (queryDto.search) {
      const searchCondition: FindOptionsWhere<Request> = {
        title: ILike(`%${queryDto.search}%`),
        requestorName: ILike(`%${queryDto.search}%`),
      };
      query.where = mergeWhereConditions(query.where, searchCondition);
    }
    return query;
  }

  private filterQuery(
    query: FindManyOptions<Request>,
    queryDto: RequestPaginateParamDto,
  ): FindManyOptions<Request> {
    const filters: FindOptionsWhere<Request> = {};

    if (queryDto.status) {
      filters.status = queryDto.status;
    }
    if (queryDto.priority) {
      filters.priority = queryDto.priority;
    }

    query.where = mergeWhereConditions(query.where, filters);
    return query;
  }

  async findOne(id: string): Promise<RequestEntityDto> {
    const request = await this.requestRepository.findOne({ where: { id } });
    if (!request) {
      throw new NotFoundException(`Request with id ${id} not found`);
    }
    return new RequestEntityDto().parseEntity(request);
  }

  async update(
    id: string,
    payload: RequestUpdateParamDto,
    user: TJWTPayload,
  ): Promise<RequestEntityDto> {
    const requestEntity = await this.requestRepository.findOne({
      where: { id },
    });
    if (!requestEntity) {
      throw new NotFoundException(`Request with id ${id} not found`);
    }

    Object.assign(requestEntity, payload);

    const saved = await this.dataSource.transaction(async (manager) => {
      const requestRepo = manager.getRepository(Request);
      const result = await requestRepo.save(requestEntity);

      await this.auditLogService.create(
        {
          actorName: user.name,
          action: AuditLogActionEnum.UPDATE,
          targetType: EntityTypeEnum.REQUEST,
          targetId: result.id,
        },
        manager,
      );

      return result;
    });

    return new RequestEntityDto().parseEntity(saved);
  }

  async remove(id: string, user: TJWTPayload): Promise<void> {
    const requestEntity = await this.requestRepository.findOne({
      where: { id },
    });
    if (!requestEntity) {
      throw new NotFoundException(`Request with id ${id} not found`);
    }

    await this.dataSource.transaction(async (manager) => {
      const requestRepo = manager.getRepository(Request);
      await requestRepo.softDelete(id);

      await this.auditLogService.create(
        {
          actorName: user.name,
          action: AuditLogActionEnum.DELETE,
          targetType: EntityTypeEnum.REQUEST,
          targetId: id,
        },
        manager,
      );
    });
  }
}
