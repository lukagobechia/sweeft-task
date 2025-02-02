import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { CompanyService } from 'src/company/company.service';
import { plainToClass } from 'class-transformer';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly companyService: CompanyService,
  ) {}

  async create(createUserDto: CreateUserDto, companyId: number): Promise<User> {
    try {
      const company = await this.companyService.findOne(companyId);
      if (!company) throw new NotFoundException('Company not found');

      const user = this.userRepository.create({ company, ...createUserDto });
      const newUser = await this.userRepository.save(user);
      return plainToClass(User, newUser);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error creating user: ' + error.message,
      );
    }
  }

  async findAll(): Promise<User[]> {
    try {
      const users = await this.userRepository.find({
        relations: ['company'],
        select: {
          company: {
            id: true,
            name: true,
            email: true,
          },
        },
      });
      if (users.length === 0) throw new NotFoundException('No users found');
      return plainToClass(User, users);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching users: ' + error.message,
      );
    }
  }

  async findOne(id: number): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        relations: ['company'],
        select: {
          company: {
            id: true,
            name: true,
            email: true,
          },
        },
      });
      if (!user) throw new NotFoundException('User not found');
      return plainToClass(User, user);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching user: ' + error.message,
      );
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.preload({ id, ...updateUserDto });
    if (!user) throw new NotFoundException('User not found');

    try {
      const updatedUser = await this.userRepository.save(user);
      return plainToClass(User, updatedUser);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error updating user: ' + error.message,
      );
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    try {
      const result = await this.userRepository.delete(id);
      if (result.affected === 0) throw new NotFoundException('User not found');

      return { message: 'User deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error deleting user: ' + error.message,
      );
    }
  }
}
