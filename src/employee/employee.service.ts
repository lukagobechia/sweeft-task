import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
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

  async addEmployee(createEmployeeDto: CreateEmployeeDto,companyId: number): Promise<Employee> {
    try {
      const company = await this.companyService.findOne(companyId);

      const existUser = await this.findEmployeeByEmail(createEmployeeDto.email);
      if (existUser)
        throw new NotFoundException('User with that email already exist');

      const employee = this.employeeRepository.create({ ...createEmployeeDto, password: '', company });
      const newEmployee = await this.employeeRepository.save(employee);

      const payload = {
        id: newEmployee.id,
        email: newEmployee.email,
        role: 'employee',
        companyId: newEmployee.company.id,
      };

      const accessToken = await this.jwtService.sign(payload, {
        expiresIn: '15m',
      });

      await this.emailSenderService.sendActivationEmailToEmployee(newEmployee,accessToken);

      return plainToClass(Employee, newEmployee);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error creating employee: 5' + error.message,
      );
    }
  }

  async findEmployeeByEmail(email: string): Promise<Employee | null> {
    const employee = await this.employeeRepository.findOne({
      where: { email },
    });
    return employee;
  }
  async findAllEmployeesInCompany(companyId: number): Promise<Employee[]> {
    try {
      const employees = await this.employeeRepository.find({
        where: { company: { id: companyId } },
        relations: ['company'],
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

  async findEmployeeInCompany(employeeId: number,companyId: number): Promise<Employee> {
    try {
      const employee = await this.employeeRepository.findOne({
        where: { id: employeeId, company: { id: companyId } },
        relations: ['company'],
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

  async updateEmployeeInCompany(id: number, companyId: number, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({ where: { id, company: { id: companyId } } });
    if (!employee) throw new NotFoundException('employee not found in the specified company');

    try {
      const updatedemployee = await this.employeeRepository.save({ ...employee, ...updateEmployeeDto });
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

  // async verifyEmployee(email: string): Promise<void> {
  //   const employee = await this.employeeRepository.findOne({
  //     where: { email },
  //   });
  //   if (!employee) {
  //     throw new NotFoundException('employee not found');
  //   }
  //   employee.isActive = true;
  //   await this.employeeRepository.save(employee);
  // }

  async getCurrentEmployee(employeeId: number): Promise<Employee> {
    try {
      const employee = await this.employeeRepository.findOne({
        where: { id: employeeId },
        relations: ['company'],
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
