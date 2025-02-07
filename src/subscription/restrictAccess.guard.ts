import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from 'src/company/entities/company.entity';

@Injectable()
export class RestrictAccess implements CanActivate {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const company = await this.companyRepository.findOne({
      where: { id: user.companyId },
      relations: ['uploadedFiles', 'employees'],
    });

    if (!company) throw new ForbiddenException('Company not found');

    const currentDate = new Date();

    if (!company.subscriptionStartDate) {
      throw new ForbiddenException('Subscription start date is null');
    }
    const subscriptionStartDate = new Date(company.subscriptionStartDate);
    if (isNaN(subscriptionStartDate.getTime())) {
      throw new ForbiddenException('Invalid subscription start date');
    }

    const dueDate = new Date(subscriptionStartDate);
    dueDate.setMonth(subscriptionStartDate.getMonth() + 1);

    const hardcodedDate = new Date('2023-01-01');
    if (currentDate > dueDate) {
      throw new ForbiddenException(
        'Account access restricted due to unpaid subscription for more than 1 month',
      );
    }

    return true;
  }
}