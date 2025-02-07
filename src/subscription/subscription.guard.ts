import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from 'src/company/entities/company.entity';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const company = await this.companyRepository.findOne({ where: { id: user.companyId }, relations: ['uploadedFiles', 'employees'] });

    if (!company) throw new ForbiddenException('Company not found');

    const currentFiles = company.uploadedFiles.length;
    const currentEmployees = company.employees.length;

    let fileLimit: number;
    let employeeLimit: number;

    if (company.subscriptionPlan === 'free tier') {
      fileLimit = 10;
      employeeLimit = 1;
    } else if (company.subscriptionPlan === 'basic') {
      fileLimit = 100;
      employeeLimit = 10;
    } else if (company.subscriptionPlan === 'premium') {
      fileLimit = 1000;
      employeeLimit = Infinity;
    } else {
      throw new ForbiddenException('Invalid subscription plan');
    }

    if (currentFiles >= fileLimit) {
      throw new ForbiddenException('File upload limit reached. To upload more files, please upgrade your subscription plan');
    }

    if (currentEmployees > employeeLimit) {
      throw new ForbiddenException('Employee limit exceeded, to add more employees please upgrade your subscription plan');
    }

    return true;
  }
}