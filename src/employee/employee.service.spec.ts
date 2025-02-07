import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeService } from './employee.service';
import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CompanyService } from 'src/company/company.service';
import { EmailSenderService } from 'src/email-sender/email-sender.service';
import { JwtService } from '@nestjs/jwt';
import {
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Company } from 'src/company/entities/company.entity';
import { plainToClass } from 'class-transformer';

const mockCompany = plainToClass(Company, {
  id: 1,
  name: 'Tech Corp',
  email: 'info@techcorp.com',
  password: 'hashedpassword',
  role: 'company',
  country: 'USA',
  industry: 'Technology',
  subscriptionPlan: 'premium',
  isActive: true,
  employees: [],
  uploadedFiles: [],
  subscriptionStartDate: new Date(),
  billingAmount: 0,
  isPaid: true,
});

const mockEmployee = plainToClass(Employee, {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  password: 'hashedpassword',
  company: mockCompany,
  role: 'employee',
  isActive: true,
  uploadedFiles: [],
});

const mockEmployeeRepository = {
  create: jest.fn().mockImplementation((dto) => dto),
  save: jest.fn().mockResolvedValue(mockEmployee),
  findOne: jest.fn(),
  find: jest.fn().mockResolvedValue([mockEmployee]),
  delete: jest.fn().mockResolvedValue({ affected: 1 }),
};

const mockCompanyService = {
  findOne: jest.fn().mockResolvedValue(mockCompany),
};

const mockEmailSenderService = {
  sendActivationEmailToEmployee: jest.fn().mockResolvedValue(undefined),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mocked-jwt-token'),
};

describe('EmployeeService - Managing employees efficiently', () => {
  let service: EmployeeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeService,
        {
          provide: getRepositoryToken(Employee),
          useValue: mockEmployeeRepository,
        },
        { provide: CompanyService, useValue: mockCompanyService },
        { provide: EmailSenderService, useValue: mockEmailSenderService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<EmployeeService>(EmployeeService);
  });

  describe('Adding a new employee', () => {
    it('should successfully add an employee when data is valid', async () => {
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashedpassword'));
      jest.spyOn(service, 'findEmployeeByEmail').mockResolvedValue(null);

      const result = await service.addEmployee(
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
        },
        1,
      );

      expect(result).toEqual(mockEmployee);
      expect(mockEmployeeRepository.save).toHaveBeenCalled();
      expect(mockEmailSenderService.sendActivationEmailToEmployee).toHaveBeenCalled();
    });

    it('should throw an error if the email is already registered', async () => {
      jest.spyOn(service, 'findEmployeeByEmail').mockResolvedValue(mockEmployee);

      await expect(
        service.addEmployee(
          {
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'john.doe@example.com',
          },
          1,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Fetching employees', () => {
    it('should return an employee when given a valid ID', async () => {
      mockEmployeeRepository.findOne.mockResolvedValue(mockEmployee);
      const result = await service.findOne(1);
      expect(result).toEqual(mockEmployee);
    });

    it('should throw an error when employee is not found', async () => {
      mockEmployeeRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('Deleting an employee', () => {
    it('should successfully delete an employee', async () => {
      mockEmployeeRepository.findOne.mockResolvedValue(mockEmployee);
      const result = await service.removeEmployeeInCompany(1, 1);
      expect(result).toEqual({ message: 'employee deleted successfully' });
    });

    it('should throw an error if the employee does not exist', async () => {
      mockEmployeeRepository.findOne.mockResolvedValue(null);
      await expect(service.removeEmployeeInCompany(99, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});