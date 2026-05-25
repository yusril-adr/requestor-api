import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

import { User } from '@entities/requestor/user.entity';
import { AuditLog } from '@entities/requestor/audit-log.entity';
import { EntityTypeEnum } from '@shared/enums/entity.enum';
import { AuditLogActionEnum } from '@shared/enums/audit-log.enum';
import { toCamelCaseArray } from '@shared/utils/common';

// Load .env file
config();

export default class UserSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const logger = new Logger(UserSeeder.name);
    logger.log(
      '/* ------------------------- Start Seeding User Data ------------------------ */',
    );

    const configService = new ConfigService();
    const dummyPassword = bcrypt.hashSync(
      configService.get('USER_DUMMY_PASSWORD'),
      parseInt(configService.get<string>('SALT_ROUND') as string),
    );
    const JSON_FILE_PATH = path.join(__dirname, './datas/user.json');

    const jsonDatas = fs.readFileSync(JSON_FILE_PATH, 'utf-8');
    const userDatas = toCamelCaseArray(JSON.parse(jsonDatas));

    let toBeInsertedUsers = userDatas.map((jsonData) => {
      const user = new User();
      user.password = dummyPassword;

      for (const key in jsonData) {
        if (jsonData.hasOwnProperty(key)) {
          user[key] = jsonData[key];
        }
      }

      return user;
    });

    await dataSource.transaction(async (transactionalEntityManager) => {
      const userRepository = transactionalEntityManager.getRepository(User);
      const auditLogRepository =
        transactionalEntityManager.getRepository(AuditLog);
      const userEmails = toBeInsertedUsers.map((user) => user.email);
      const [existingUsers, existingUserCount] =
        await userRepository.findAndCount({
          where: userEmails.map((email) => ({ email })),
        });

      if (existingUserCount === toBeInsertedUsers.length) {
        logger.log('User already seeded');
        logger.log(
          '/* ------------------------- Finish Seeding User Data ------------------------ */',
        );
        return;
      }

      let usersToSave = toBeInsertedUsers.filter((toBeInsertedUser) => {
        const isNotExist = !existingUsers.some(
          (existingUser) =>
            existingUser.email === toBeInsertedUser.email &&
            existingUser.name === toBeInsertedUser.name,
        );
        return isNotExist;
      });

      logger.log('Seeding User');
      const insertedUsers = await userRepository.save(usersToSave);

      const auditLogs = insertedUsers.map((user) => {
        const auditLog = new AuditLog();
        auditLog.actorName = 'Seeder';
        auditLog.action = AuditLogActionEnum.CREATE;
        auditLog.targetType = EntityTypeEnum.USER;
        auditLog.targetId = user.id;
        return auditLog;
      });

      await auditLogRepository.insert(auditLogs);
      logger.log(`Created ${auditLogs.length} audit log entries`);

      logger.log(
        '/* ------------------------- Finish Seeding User Data ------------------------ */',
      );
    });
  }
}
