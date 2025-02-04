import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { Company } from 'src/company/entities/company.entity';
import { Employee } from 'src/employee/entities/employee.entity';

@Injectable()
export class EmailSenderService {
  constructor(private readonly mailService: MailerService) {}

  async sendMail(
    recipient: string,
    subject: string,
    html: string,
  ): Promise<void> {
    try {
      await this.mailService.sendMail({
        from: 'CManagent <info@cmanagement.com>',
        to: recipient,
        subject: subject,
        html: html,
      });
    } catch (error) {
      console.error(`Failed to send email to ${recipient}`, error);
      throw new Error('Email sending failed');
    }
  }

  async sendActivationEmailToCompany(company: Company, accessToken: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h3>${company.name}, welcome to CManagement!</h3>
      <p>Thank you for signing up. Please activate your email by clicking the link below:</p>
      <a 
        href="http://localhost:3000/auth/confirm-email?token=${accessToken}" 
        style="display: inline-block; padding: 10px 20px; margin: 10px 0; font-size: 16px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;"
      >
        Activate Account
      </a>
      <p>If you did not sign up for this account, please ignore this email.</p>
      <p>Best regards,<br/>Cmanagement Team</p>
      </div>
    `;

    await this.sendMail(company.email, 'Account Activation', html);
  }

  async sendActivationEmailToEmployee(employee: Employee, accessToken: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h3>Dear ${employee.firstName},</h3>
        <p>${employee.company.name} has added you as an employee.</p>
        <p>Please set your password and activate your email by clicking the link below:</p>
        <a 
          href="http://localhost:3000/auth/confirm-email?token=${accessToken}" 
          style="display: inline-block; padding: 10px 20px; margin: 10px 0; font-size: 16px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;"
        >
          Activate Account
        </a>
        <p>If you did not expect this email, please ignore it.</p>
        <p>Best regards,<br/>CManagement Team</p>
      </div>
    `;
    
    await this.sendMail(employee.email, 'Account Activation', html);
  }

  async sendResetPasswordEmail(company: Company, resetToken: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h3>Dear ${company.name},</h3>
      <p>To reset your password, please click the link below:</p>
      <a 
        href="http://localhost:3000/auth/reset-password?token=${resetToken}" 
        style="display: inline-block; padding: 10px 20px; margin: 10px 0; font-size: 16px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;"
      >
        Reset Password
      </a>
      <p>If you did not request a password reset, please ignore this email.</p>
      </div>
    `;

    await this.sendMail(company.email, 'Reset Password', html);
  }
}
