import * as bcrypt from 'bcrypt';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, FindManyOptions, FindOptionsWhere, ILike } from 'typeorm';
import { camelCase } from 'typeorm/util/StringUtils';
import { UserRepository } from './user.repository';
import { UserPaginateParamDto } from './dtos/params/user-paginate.param.dto';
import { UserCreateParamDto } from './dtos/params/user-create.param.dto';
import { UserUpdateParamDto } from './dtos/params/user-update.param.dto';
import { UserEntityDto } from './dtos/results/user-entity.result.dto';
import { mergeWhereConditions } from '@shared/utils/common';
import { User } from '@entities/requestor/user.entity';
import { UserStatusEnum } from '@shared/enums/user.enum';
import { TJWTPayload } from '@shared/types/jwt-payload.type';
import { AuditLogService } from '@modules/AuditLog/audit-log.service';
import { AuditLogActionEnum } from '@shared/enums/audit-log.enum';
import { EntityTypeEnum } from '@shared/enums/entity.enum';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly auditLogService: AuditLogService,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    payload: UserCreateParamDto,
    user: TJWTPayload,
  ): Promise<UserEntityDto> {
    const existing = await this.userRepository.findOne({
      where: { email: payload.email },
    });
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);

    const saved = await this.dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);
      const userEntity = userRepo.create({
        ...payload,
        password: hashedPassword,
      });
      const result = await userRepo.save(userEntity);

      await this.auditLogService.create(
        {
          actorName: user.name,
          action: AuditLogActionEnum.CREATE,
          targetType: EntityTypeEnum.USER,
          targetId: result.id,
        },
        manager,
      );

      return result;
    });

    return new UserEntityDto().parseEntity(saved);
  }

  async paginate(
    queryDto: UserPaginateParamDto,
  ): Promise<[UserEntityDto[], number]> {
    let query: FindManyOptions<User> = {
      order: {
        [camelCase(queryDto.sortBy)]: queryDto.order,
      },
    };

    query = this.searchQuery(query, queryDto);
    query = this.filterQuery(query, queryDto);

    const users = await this.userRepository.find({
      ...query,
      take: queryDto.perPage,
      skip: queryDto.perPage * (queryDto.page - 1),
    });

    const count = await this.userRepository.count(query);
    return [users.map((user) => new UserEntityDto().parseEntity(user)), count];
  }

  private searchQuery(
    query: FindManyOptions<User>,
    queryDto: UserPaginateParamDto,
  ): FindManyOptions<User> {
    if (queryDto.search) {
      const searchCondition: FindOptionsWhere<User> = {
        name: ILike(`%${queryDto.search}%`),
        email: ILike(`%${queryDto.search}%`),
      };
      query.where = mergeWhereConditions(query.where, searchCondition);
    }
    return query;
  }

  private filterQuery(
    query: FindManyOptions<User>,
    queryDto: UserPaginateParamDto,
  ): FindManyOptions<User> {
    const filters: (FindOptionsWhere<User> | null)[] = [
      queryDto.role ? { role: queryDto.role } : null,
      queryDto.status ? { status: queryDto.status } : null,
    ].filter(Boolean); // Remove null values

    query.where = mergeWhereConditions(query.where, ...filters);
    return query;
  }

  async findOne(id: string): Promise<UserEntityDto> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return new UserEntityDto().parseEntity(user);
  }

  async update(
    id: string,
    payload: UserUpdateParamDto,
    user: TJWTPayload,
  ): Promise<UserEntityDto> {
    const userEntity = await this.userRepository.findOne({ where: { id } });
    if (!userEntity) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    if (payload.email && payload.email !== userEntity.email) {
      const existing = await this.userRepository.findOne({
        where: { email: payload.email },
      });
      if (existing) {
        throw new ConflictException('Email already exists');
      }
    }

    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10);
    }

    Object.assign(userEntity, payload);

    const saved = await this.dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);
      const result = await userRepo.save(userEntity);

      await this.auditLogService.create(
        {
          actorName: user.name,
          action: AuditLogActionEnum.UPDATE,
          targetType: EntityTypeEnum.USER,
          targetId: result.id,
        },
        manager,
      );

      return result;
    });

    return new UserEntityDto().parseEntity(saved);
  }

  async remove(id: string, user: TJWTPayload): Promise<void> {
    const userEntity = await this.userRepository.findOne({ where: { id } });
    if (!userEntity) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    await this.dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);
      await userRepo.softDelete(id);

      await this.auditLogService.create(
        {
          actorName: user.name,
          action: AuditLogActionEnum.DELETE,
          targetType: EntityTypeEnum.USER,
          targetId: id,
        },
        manager,
      );
    });
  }
}
