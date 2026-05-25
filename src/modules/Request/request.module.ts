import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Request } from '@entities/requestor/request.entity';
import { RequestRepository } from './request.repository';
import { RequestService } from './request.service';
import { RequestController } from './request.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Request])],
  controllers: [RequestController],
  providers: [RequestRepository, RequestService],
  exports: [RequestRepository, RequestService],
})
export class RequestModule {}
