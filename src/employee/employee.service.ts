import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from './entities/employee.entity';
import { CompanyService } from 'src/company/company.service';
import { plainToClass, plainToInstance } from 'class-transformer';
import { EmailSenderService } from 'src/email-sender/email-sender.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    private readonly companyService: CompanyService,
    private readonly emailSenderService: EmailSenderService,
    private readonly jwtService: JwtService,
  ) {}

  async addEmployee(
    createEmployeeDto: CreateEmployeeDto,
    companyId: number,
  ): Promise<Employee> {
    try {
      const company = await this.companyService.findOne(companyId);

      const existUser = await this.findEmployeeByEmail(createEmployeeDto.email);
      if (existUser)
        throw new BadRequestException('User with that email already exist');
      const temporaryPassword = this.generateTemporaryPassword();
      const HashedtemporaryPassword = await bcrypt.hash(temporaryPassword, 10);
      
      const employee = this.employeeRepository.create({
        ...createEmployeeDto,
        password: HashedtemporaryPassword,
        company,
      });
      const newEmployee = await this.employeeRepository.save(employee);

      const payload = {
        id: newEmployee.id,
        email: newEmployee.email,
        role: 'employee',
        companyId: company.id,
      };

      const accessToken = await this.jwtService.sign(payload, {
        expiresIn: '15m',
      });

      await this.emailSenderService.sendActivationEmailToEmployee(
        newEmployee,
        accessToken,
        temporaryPassword,
      );

      return plainToClass(Employee, newEmployee);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error creating employee: 5' + error.message,
      );
    }
  }

  generateTemporaryPassword(): string {
    const length = 10;
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const digits = '0123456789';

    let password = ['A', '@'];

    const allChars = lowercase + digits;
    while (password.length < length) {
      password.push(allChars[Math.floor(Math.random() * allChars.length)]);
    }
    return password.sort(() => Math.random() - 0.5).join('');
  }

  async findEmployeeByEmail(email: string): Promise<Employee | null> {
    const employee = await this.employeeRepository.findOne({
      where: { email },
      relations: ['company'],
      select: {
        company: {
          id: true,
          name: true,
          email: true,
        },
      },
    });
    return employee;
  }

  async findOne(id: number): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: ['company'],
    });
    if (!employee) throw new NotFoundException('employee not found 5');
    return employee;
  }

  async findAllEmployeesInCompany(companyId: number): Promise<Employee[]> {
    try {
      const employees = await this.employeeRepository.find({
        where: { company: { id: companyId } },
        relations: ['company', 'uploadedFiles'],
        select: {
          company: {
            id: true,
            name: true,
            email: true,
          },
        },
      });
      if (employees.length === 0) return [];
      return plainToInstance(Employee, employees);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching employees: ' + error.message,
      );
    }
  }

  async findEmployeeInCompany(
    employeeId: number,
    companyId: number,
  ): Promise<Employee> {
    try {
      const employee = await this.employeeRepository.findOne({
        where: { id: employeeId, company: { id: companyId } },
        relations: ['company', 'uploadedFiles'],
        select: {
          company: {
            id: true,
            name: true,
            email: true,
          },
        },
      });
      if (!employee)
        throw new NotFoundException(
          'employee not found in the specified company',
        );
      return plainToClass(Employee, employee);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching employee: ' + error.message,
      );
    }
  }

  async updateEmployeeInCompany(
    id: number,
    companyId: number,
    updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { id, company: { id: companyId } },
    });
    if (!employee)
      throw new NotFoundException(
        'employee not found in the specified company',
      );

    try {
      const updatedemployee = await this.employeeRepository.save({
        ...employee,
        ...updateEmployeeDto,
      });
      return plainToClass(Employee, updatedemployee);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error updating employee: ' + error.message,
      );
    }
  }

  async removeEmployeeInCompany(
    id: number,
    companyId: number,
  ): Promise<{ message: string }> {
    const employee = await this.employeeRepository.findOne({
      where: { id, company: { id: companyId } },
    });
    if (!employee)
      throw new NotFoundException(
        'employee not found in the specified company',
      );

    try {
      const result = await this.employeeRepository.delete(id);
      if (result.affected === 0)
        throw new NotFoundException('employee not found');

      return { message: 'employee deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error deleting employee: ' + error.message,
      );
    }
  }

  async getCurrentEmployee(employeeId: number): Promise<Employee> {
    try {
      const employee = await this.employeeRepository.findOne({
        where: { id: employeeId },
        relations: ['company', 'uploadedFiles'],
      });
      if (!employee) throw new NotFoundException('employee not found 5');
      return plainToClass(Employee, employee);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching employee: ' + error.message,
      );
    }
  }
}