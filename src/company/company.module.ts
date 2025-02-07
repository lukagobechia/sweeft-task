import { forwardRef, Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { JwtModule } from '@nestjs/jwt';
import { EmployeeModule } from 'src/employee/employee.module';

@Module({
  imports: [
    forwardRef(() => EmployeeModule),
    TypeOrmModule.forFeature([Company]),
  ],
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [CompanyService, TypeOrmModule],
})
export class CompanyModule {}
