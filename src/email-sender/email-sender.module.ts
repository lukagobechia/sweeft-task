import { Module } from '@nestjs/common';
import { EmailSenderService } from './email-sender.service';
import { EmailSenderController } from './email-sender.controller';

@Module({
  providers: [EmailSenderService],
  controllers: [EmailSenderController],
})
export class EmailSenderModule {}
