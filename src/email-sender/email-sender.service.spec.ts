import { Test, TestingModule } from '@nestjs/testing';
import { EmailSenderService } from './email-sender.service';
import { MailerService } from '@nestjs-modules/mailer';
import { Company } from 'src/company/entities/company.entity';
import { Employee } from 'src/employee/entities/employee.entity';

const mockMailerService = {
  sendMail: jest.fn(),
};

describe('EmailSenderService', () => {
  let service: EmailSenderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailSenderService,
        { provide: MailerService, useValue: mockMailerService },
      ],
    }).compile();

    service = module.get<EmailSenderService>(EmailSenderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendMail', () => {
    it('should send an email successfully', async () => {
      mockMailerService.sendMail.mockResolvedValue(undefined);

      await service.sendMail('test@example.com', 'Test Subject', '<p>Test</p>');

      expect(mockMailerService.sendMail).toHaveBeenCalledWith({
        from: 'CManagent <info@cmanagement.com>',
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test</p>',
      });
    });

    it('should throw an error if email sending fails', async () => {
      mockMailerService.sendMail.mockRejectedValue(new Error('Email sending failed'));

      await expect(
        service.sendMail('test@example.com', 'Test Subject', '<p>Test</p>'),
      ).rejects.toThrow('Email sending failed');
    });
  });

  describe('sendActivationEmailToCompany', () => {
    it('should send an activation email to a company', async () => {
      const company: Company = {
        id: 1,
        name: 'Test Company',
        email: 'company@example.com',
        password: 'password',
        role: 'company',
        country: 'Country',
        industry: 'Industry',
        subscriptionPlan: 'basic',
        subscriptionStartDate: new Date(),
        billingAmount: 0,
        isActive: false,
        employees: [],
        uploadedFiles: [],
      };

      const accessToken = 'test-access-token';

      mockMailerService.sendMail.mockResolvedValue(undefined);

      await service.sendActivationEmailToCompany(company, accessToken);

      expect(mockMailerService.sendMail).toHaveBeenCalledWith({
        from: 'CManagent <info@cmanagement.com>',
        to: 'company@example.com',
        subject: 'Account Activation',
        html: expect.stringContaining('Activate Account'),
      });
    });
  });

  describe('sendActivationEmailToEmployee', () => {
    it('should send an activation email to an employee', async () => {
      const employee: Employee = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'employee@example.com',
        password: 'password',
        role: 'employee',
        isActive: false,
        company: {
          id: 1,
          name: 'Test Company',
          email: 'company@example.com',
          password: 'password',
          role: 'company',
          country: 'Country',
          industry: 'Industry',
          subscriptionPlan: 'basic',
          subscriptionStartDate: new Date(),
          billingAmount: 0,
          isActive: false,
          employees: [],
          uploadedFiles: [],
        },
        uploadedFiles: [],
      };

      const accessToken = 'test-access-token';
      const temporaryPassword = 'temp-password';

      mockMailerService.sendMail.mockResolvedValue(undefined);

      await service.sendActivationEmailToEmployee(employee, accessToken, temporaryPassword);

      expect(mockMailerService.sendMail).toHaveBeenCalledWith({
        from: 'CManagent <info@cmanagement.com>',
        to: 'employee@example.com',
        subject: 'Account Activation',
        html: expect.stringContaining('Activate Account'),
      });
    });
  });

  describe('resendActivationEmailToEmployee', () => {
    it('should resend an activation email to an employee', async () => {
      const employee: Employee = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'employee@example.com',
        password: 'password',
        role: 'employee',
        isActive: false,
        company: {
          id: 1,
          name: 'Test Company',
          email: 'company@example.com',
          password: 'password',
          role: 'company',
          country: 'Country',
          industry: 'Industry',
          subscriptionPlan: 'basic',
          subscriptionStartDate: new Date(),
          billingAmount: 0,
          isActive: false,
          employees: [],
          uploadedFiles: [],
        },
        uploadedFiles: [],
      };

      const accessToken = 'test-access-token';

      mockMailerService.sendMail.mockResolvedValue(undefined);

      await service.resendActivationEmailToEmployee(employee, accessToken);

      expect(mockMailerService.sendMail).toHaveBeenCalledWith({
        from: 'CManagent <info@cmanagement.com>',
        to: 'employee@example.com',
        subject: 'Account Activation',
        html: expect.stringContaining('Activate Account'),
      });
    });
  });

  describe('sendResetPasswordEmail', () => {
    it('should send a reset password email to a company', async () => {
      const company: Company = {
        id: 1,
        name: 'Test Company',
        email: 'company@example.com',
        password: 'password',
        role: 'company',
        country: 'Country',
        industry: 'Industry',
        subscriptionPlan: 'basic',
        subscriptionStartDate: new Date(),
        billingAmount: 0,
        isActive: false,
        employees: [],
        uploadedFiles: [],
      };

      const resetToken = 'test-reset-token';

      mockMailerService.sendMail.mockResolvedValue(undefined);

      await service.sendResetPasswordEmail(company, resetToken);

      expect(mockMailerService.sendMail).toHaveBeenCalledWith({
        from: 'CManagent <info@cmanagement.com>',
        to: 'company@example.com',
        subject: 'Reset Password',
        html: expect.stringContaining('Reset Password'),
      });
    });
  });
});