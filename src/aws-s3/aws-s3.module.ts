import { Module } from '@nestjs/common';
import { AwsS3Service } from './aws-s3.service';
import { CompanyModule } from 'src/company/company.module';
import { EmployeeModule } from 'src/employee/employee.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from 'src/file/entities/file.entity';

@Module({
  imports: [
    CompanyModule,
    EmployeeModule,
    TypeOrmModule.forFeature([File]),
  ],
  providers: [AwsS3Service],
  exports: [AwsS3Service],
})
export class AwsS3Module {}
