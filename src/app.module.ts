import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { CompanyModule } from './company/company.module';
import { Company } from './company/entities/company.entity';
import { User } from './user/entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailSenderModule } from './email-sender/email-sender.module';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [User, Company],
        synchronize: true,
        logging: true,
      }),
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        }
      }
    }),
    UserModule,
    CompanyModule,
    EmailSenderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
