// import { Body, Controller, Post, Res } from '@nestjs/common';
// import { EmailSenderService } from './email-sender.service';
// import { SendEmailDto } from './dto/send-email.dto';

// @Controller('email-sender')
// export class EmailSenderController {
//   constructor(private readonly emailSenderService: EmailSenderService) {}

//   @Post()
//   sendMailer(@Res() response: any, @Body() body: SendEmailDto) {
//     const { recipient, subject, message } = body;
//     const mail = this.emailSenderService.sendMail(recipient, subject, message);

//     return response.status(200).json({
//       message: 'success',
//       mail,
//     });
//   }
// }
