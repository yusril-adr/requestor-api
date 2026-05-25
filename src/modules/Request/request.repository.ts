import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Request } from '@entities/requestor/request.entity';

@Injectable()
export class RequestRepository extends Repository<Request> {
  constructor(private readonly dataSource: DataSource) {
    super(Request, dataSource.createEntityManager());
  }

  async findAndValidateRequestByIds(requestIds: string[]): Promise<Request[]> {
    const requestDatas = await this.find({
      where: requestIds.map((id) => ({ id })),
    });
    const notFoundIds = requestIds.filter(
      (id) => !requestDatas.map((r) => r.id).includes(id),
    );

    if (notFoundIds.length) {
      throw new NotFoundException(`Request with id ${notFoundIds} not found`);
    }

    return requestDatas;
  }
}
