import { Controller, Get, Query } from '@nestjs/common';
import * as wrapper from '@shared/utils/wrapper';
import { AuditLogService } from './audit-log.service';
import { AuditLogPaginateParamDto } from './dtos/params/audit-log-paginate.param.dto';

@Controller({
  path: 'audit-logs',
  version: '1',
})
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  async paginate(@Query() query: AuditLogPaginateParamDto) {
    const [data, count] = await this.auditLogService.paginate(query);
    return wrapper.paginationResponse({
      data,
      count,
      query,
      message: 'Audit logs retrieved successfully',
    });
  }
}
