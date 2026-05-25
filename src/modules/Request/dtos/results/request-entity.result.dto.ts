import type { TRequest } from '@entities/requestor/request.entity';
import { RequestStatusEnum, RequestPriorityEnum } from '@shared/enums/request.enum';
import dayjs from '@shared/utils/dayjs';

export type TRequestEntityDto = Omit<
  TRequest,
  'createdAt' | 'updatedAt'
> & {
  createdAt: string | Date;
  updatedAt: string | Date;
};

export class RequestEntityDto implements TRequestEntityDto {
  id: string;
  title: string;
  requestorName: string;
  status: RequestStatusEnum;
  priority: RequestPriorityEnum;
  assigneeName?: string | null;
  createdAt: string;
  updatedAt: string;

  parseEntity({
    id,
    title,
    requestorName,
    status,
    priority,
    assigneeName,
    createdAt,
    updatedAt,
  }: TRequestEntityDto): RequestEntityDto {
    this.id = id;
    this.title = title;
    this.requestorName = requestorName;
    this.status = status;
    this.priority = priority;
    this.assigneeName = assigneeName ?? null;
    this.createdAt = dayjs(createdAt).toISOString();
    this.updatedAt = dayjs(updatedAt).toISOString();

    return this;
  }
}
