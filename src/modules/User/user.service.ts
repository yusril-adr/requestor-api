import * as bcrypt from 'bcrypt';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FindManyOptions, FindOptionsWhere, ILike } from 'typeorm';
import { camelCase } from 'typeorm/util/StringUtils';
import { UserRepository } from './user.repository';
import { UserPaginateParamDto } from './dtos/params/user-paginate.param.dto';
import { UserCreateParamDto } from './dtos/params/user-create.param.dto';
import { UserUpdateParamDto } from './dtos/params/user-update.param.dto';
import { UserEntityDto } from './dtos/results/user-entity.result.dto';
import { mergeWhereConditions } from '@shared/utils/common';
import { User } from '@entities/requestor/user.entity';
import { UserStatusEnum } from '@shared/enums/user.enum';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(payload: UserCreateParamDto): Promise<UserEntityDto> {
    const existing = await this.userRepository.findOne({
      where: { email: payload.email },
    });
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);
    const user = this.userRepository.create({
      ...payload,
      password: hashedPassword,
    });
    const saved = await this.userRepository.save(user);
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
  ): Promise<UserEntityDto> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    if (payload.email && payload.email !== user.email) {
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

    Object.assign(user, payload);
    const saved = await this.userRepository.save(user);
    return new UserEntityDto().parseEntity(saved);
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    await this.userRepository.softDelete(id);
  }
}
