import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailSenderService {
  constructor(private readonly mailService: MailerService) {}

async sendMail(recipient: string, subject: string, message: string): Promise<void> {
    try {
        await this.mailService.sendMail({
            from: 'CManagent <info@cmanagement.com>',
            to: recipient,
            subject: subject,
            text: message,
        });
    } catch (error) {
        console.error(`Failed to send email to ${recipient}`, error);
        throw new Error('Email sending failed');
    }
}
}
