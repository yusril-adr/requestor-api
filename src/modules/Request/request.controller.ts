import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import * as wrapper from '@shared/utils/wrapper';
import { Roles } from '@shared/decorators/role.decorator';
import { RoleKeyEnum } from '@shared/enums/role.enum';
import { RequestService } from './request.service';
import { RequestPaginateParamDto } from './dtos/params/request-paginate.param.dto';
import { RequestCreateParamDto } from './dtos/params/request-create.param.dto';
import { RequestUpdateParamDto } from './dtos/params/request-update.param.dto';

@Controller({
  path: 'requests',
  version: '1',
})
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @Post()
  @Roles([RoleKeyEnum.ADMIN])
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() payload: RequestCreateParamDto) {
    const result = await this.requestService.create(payload);
    return wrapper.response({
      statusCode: HttpStatus.CREATED,
      data: result,
      message: 'Request created successfully',
    });
  }

  @Get()
  async paginate(@Query() query: RequestPaginateParamDto) {
    const [data, count] = await this.requestService.paginate(query);
    return wrapper.paginationResponse({
      data,
      count,
      query,
      message: 'Requests retrieved successfully',
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.requestService.findOne(id);
    return wrapper.response({
      data: result,
      message: 'Request retrieved successfully',
    });
  }

  @Patch(':id')
  @Roles([RoleKeyEnum.ADMIN])
  async update(
    @Param('id') id: string,
    @Body() payload: RequestUpdateParamDto,
  ) {
    const result = await this.requestService.update(id, payload);
    return wrapper.response({
      data: result,
      message: 'Request updated successfully',
    });
  }

  @Delete(':id')
  @Roles([RoleKeyEnum.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.requestService.remove(id);
  }
}
