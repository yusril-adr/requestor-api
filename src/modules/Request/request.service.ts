import { Injectable, NotFoundException } from '@nestjs/common';
import { FindManyOptions, FindOptionsWhere, ILike } from 'typeorm';
import { camelCase } from 'typeorm/util/StringUtils';
import { RequestRepository } from './request.repository';
import { RequestPaginateParamDto } from './dtos/params/request-paginate.param.dto';
import { RequestCreateParamDto } from './dtos/params/request-create.param.dto';
import { RequestUpdateParamDto } from './dtos/params/request-update.param.dto';
import { RequestEntityDto } from './dtos/results/request-entity.result.dto';
import { mergeWhereConditions } from '@shared/utils/common';
import { Request } from '@entities/requestor/request.entity';

@Injectable()
export class RequestService {
  constructor(private readonly requestRepository: RequestRepository) {}

  async create(payload: RequestCreateParamDto): Promise<RequestEntityDto> {
    const request = this.requestRepository.create(payload);
    const saved = await this.requestRepository.save(request);
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
    const filters: (FindOptionsWhere<Request> | null)[] = [
      queryDto.status ? { status: queryDto.status } : null,
      queryDto.priority ? { priority: queryDto.priority } : null,
    ].filter(Boolean);

    query.where = mergeWhereConditions(query.where, ...filters);
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
  ): Promise<RequestEntityDto> {
    const request = await this.requestRepository.findOne({ where: { id } });
    if (!request) {
      throw new NotFoundException(`Request with id ${id} not found`);
    }

    Object.assign(request, payload);
    const saved = await this.requestRepository.save(request);
    return new RequestEntityDto().parseEntity(saved);
  }

  async remove(id: string): Promise<void> {
    const request = await this.requestRepository.findOne({ where: { id } });
    if (!request) {
      throw new NotFoundException(`Request with id ${id} not found`);
    }
    await this.requestRepository.softDelete(id);
  }
}
