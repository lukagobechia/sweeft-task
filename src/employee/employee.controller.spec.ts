import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { IsEmployee } from 'src/auth/guards/role.guard';
import { ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { CompanyService } from 'src/company/company.service';
import { EmailSenderService } from 'src/email-sender/email-sender.service';
import { NotFoundException } from '@nestjs/common';

const mockEmployeeService = {
  getCurrentEmployee: jest.fn().mockResolvedValue({
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    role: 'employee',
    isActive: true,
    uploadedFiles: [],
  }),
};

const mockAuthGuard = {
  canActivate: jest.fn((context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    request.user = { id: 1, role: 'employee' };
    return true;
  }),
};

const mockIsEmployeeGuard = {
  canActivate: jest.fn((context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    request.user = { id: 1, role: 'employee' };
    return true;
  }),
};

describe('EmployeeController', () => {
  let controller: EmployeeController;
  let service: EmployeeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeController],
      providers: [
        { provide: EmployeeService, useValue: mockEmployeeService },
        { provide: JwtService, useValue: {} },
        { provide: getRepositoryToken(Employee), useValue: {} },
        { provide: CompanyService, useValue: {} },
        { provide: EmailSenderService, useValue: {} },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(IsEmployee)
      .useValue(mockIsEmployeeGuard)
      .compile();

    controller = module.get<EmployeeController>(EmployeeController);
    service = module.get<EmployeeService>(EmployeeService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCurrentEmployee', () => {
    it('should return the current employee', async () => {
      const req = { user: { id: 1 } };
      const result = await controller.getCurrentEmployee(req);
      expect(result).toEqual({
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'employee',
        isActive: true,
        uploadedFiles: [],
      });
      expect(service.getCurrentEmployee).toHaveBeenCalledWith(1);
    });

    it('should throw a NotFoundException if the employee is not found', async () => {
      jest.spyOn(service, 'getCurrentEmployee').mockRejectedValueOnce(new NotFoundException('Employee not found'));

      const req = { user: { id: 1 } };
      await expect(controller.getCurrentEmployee(req)).rejects.toThrow(NotFoundException);
    });
  });
});