import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { EmailSenderModule } from 'src/email-sender/email-sender.module';
import { CompanyModule } from 'src/company/company.module';
import { EmployeeModule } from 'src/employee/employee.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    EmailSenderModule,
    CompanyModule,
    EmployeeModule,
    ConfigModule.forRoot(),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
    })
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
