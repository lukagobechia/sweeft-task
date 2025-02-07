import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { CompanyModule } from 'src/company/company.module';
import { AwsS3Module } from 'src/aws-s3/aws-s3.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { EmployeeModule } from 'src/employee/employee.module';
@Module({
  imports: [
    CompanyModule,
    AwsS3Module,
    EmployeeModule,
    TypeOrmModule.forFeature([File]),
  ],
  providers: [FileService],
  controllers: [FileController],
  exports: [FileService],
})
export class FileModule {}
