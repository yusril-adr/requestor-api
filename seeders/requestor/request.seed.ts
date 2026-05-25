import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { config } from 'dotenv';
import { Logger } from '@nestjs/common';

import { Request } from '@entities/requestor/request.entity';
import { AuditLog } from '@entities/requestor/audit-log.entity';
import { EntityTypeEnum } from '@shared/enums/entity.enum';
import { AuditLogActionEnum } from '@shared/enums/audit-log.enum';

// Load .env file
config();

export default class RequestSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const logger = new Logger(RequestSeeder.name);
    logger.log(
      '/* ------------------------- Start Seeding Request Data ------------------------ */',
    );

    const JSON_FILE_PATH = path.join(__dirname, './datas/request.json');

    const jsonDatas = fs.readFileSync(JSON_FILE_PATH, 'utf-8');
    const requestDatas = JSON.parse(jsonDatas);

    let toBeInsertedRequests = requestDatas.map((jsonData) => {
      const request = new Request();
      for (const key in jsonData) {
        if (jsonData.hasOwnProperty(key)) {
          request[key] = jsonData[key];
        }
      }
      return request;
    });

    await dataSource.transaction(async (transactionalEntityManager) => {
      const requestRepository =
        transactionalEntityManager.getRepository(Request);
      const auditLogRepository =
        transactionalEntityManager.getRepository(AuditLog);
      const existingRequests = await requestRepository.find();

      let insertedRequests: Request[];

      if (existingRequests.length === 0) {
        logger.log('Seeding Request');
        insertedRequests = await requestRepository.save(toBeInsertedRequests);
      } else {
        toBeInsertedRequests = toBeInsertedRequests.filter(
          (toBeInsertedRequest) => {
            const isNotExist = !existingRequests.some(
              (existingRequest) =>
                existingRequest.title === toBeInsertedRequest.title &&
                existingRequest.requestorName ===
                  toBeInsertedRequest.requestorName,
            );
            return isNotExist;
          },
        );

        if (toBeInsertedRequests.length > 0) {
          logger.log('Seeding Request');
          insertedRequests = await requestRepository.save(toBeInsertedRequests);
        } else {
          logger.log('Request already seeded');
          logger.log(
            '/* ------------------------- Finish Seeding Request Data ------------------------ */',
          );
          return;
        }
      }

      const auditLogs = insertedRequests.map((request) => {
        const auditLog = new AuditLog();
        auditLog.actorName = 'Seeder';
        auditLog.action = AuditLogActionEnum.CREATE;
        auditLog.targetType = EntityTypeEnum.REQUEST;
        auditLog.targetId = request.id;
        return auditLog;
      });

      await auditLogRepository.insert(auditLogs);
      logger.log(`Created ${auditLogs.length} audit log entries`);

      logger.log(
        '/* ------------------------- Finish Seeding Request Data ------------------------ */',
      );
    });
  }
}
