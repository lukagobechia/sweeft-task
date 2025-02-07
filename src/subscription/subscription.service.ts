import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CompanyService } from 'src/company/company.service';
import { Company } from 'src/company/entities/company.entity';
@Injectable()
export class SubscriptionService {
  constructor(private readonly companyService: CompanyService) {}

  private readonly planOrder = ['free tier', 'basic', 'premium'];

  async calculateSubscriptionPrice(companyId: number, type: string) {
    const company = await this.companyService.findOne(companyId);
  
    let basePrice = 0;
    let price = 0;
    const basic_employeeAddPrice = 5;
    const premium_extraFilePrice = 0.5;
  
    if (type === 'basic') {
      basePrice = company.employees.length * basic_employeeAddPrice;
      price = basePrice;
    } else if (type === 'premium') {
      basePrice = 300;
  
      if (company.uploadedFiles.length > 1000) {
        basePrice += (company.uploadedFiles.length - 1000) * premium_extraFilePrice;
      }
  
      price = basePrice;
    }
  
    return price;
  }
  

  async upgradeSubscription(companyId: number, newPlan: string) {
    const company = await this.companyService.findOne(companyId);

    if (company.subscriptionPlan === newPlan) {
      throw new BadRequestException(
        `Company is already on the '${newPlan}' plan`,
      );
    }

    const currentPlanIndex = this.planOrder.indexOf(company.subscriptionPlan);
    const newPlanIndex = this.planOrder.indexOf(newPlan);

    if (newPlanIndex <= currentPlanIndex) {
      throw new BadRequestException(
        `You cant go from '${company.subscriptionPlan}' to'${newPlan}'. Cannot downgrade or stay on the same plan using the upgrade functionality.`,
      );
    }


    const newPrice = await this.calculateSubscriptionPrice(companyId, newPlan);
    company.subscriptionPlan = newPlan;
    company.subscriptionStartDate =  new Date();
    company.billingAmount = newPrice;

    await this.companyService.update(companyId, company);

    return {
      message: `Subscription upgraded to '${newPlan}' successfully`,
      price: newPrice,
      dueDate: company.subscriptionStartDate
        ? new Date(
            new Date(company.subscriptionStartDate).setMonth(
              company.subscriptionStartDate.getMonth() + 1,
            ),
          )
        : new Date(),
    };
  }

  async downgradeSubscription(companyId: number, newPlan: string) {
    const company = await this.companyService.findOne(companyId);

    if (company.subscriptionPlan === newPlan) {
      throw new BadRequestException(
        `Company is already on the '${newPlan}' plan`,
      );
    }

    const currentPlanIndex = this.planOrder.indexOf(company.subscriptionPlan);
    const newPlanIndex = this.planOrder.indexOf(newPlan);

    if (newPlanIndex >= currentPlanIndex) {
      throw new BadRequestException(
        `You cant go from '${company.subscriptionPlan}' to'${newPlan}'. Cannot upgrade or stay on the same plan using the downgrade functionality.`,
      );
    }

    const basic_employeesLimit = 10;
    if (
      newPlan === 'basic' &&
      company.employees.length > basic_employeesLimit
    ) {
      throw new BadRequestException(
        `Cannot downgrade to basic plan. Company has ${company.employees.length} employees, exceeding the limit of ${basic_employeesLimit}.`,
      );
    }

    const free_employeesLimit = 1;
    if (
      newPlan === 'free tier' &&
      company.employees.length > free_employeesLimit
    ) {
      throw new BadRequestException(
        `Cannot downgrade to free plan. Company has ${company.employees.length} employees, exceeding the limit of ${free_employeesLimit}.`,
      );
    }

    

    company.subscriptionPlan = newPlan;
    company.subscriptionStartDate = new Date();

    const proratedAmount = await this.calculateProratedAmount(company);
    company.billingAmount = proratedAmount;


    await this.companyService.update(companyId, company);

    return { message: `Subscription downgraded to '${newPlan}' successfully` };
  }

 async calculateProratedAmount(company: Company):Promise<number> {
    if (!company.subscriptionStartDate) {
      return 0;
    }

    const currentDate = new Date();
    const startDate = new Date(company.subscriptionStartDate);
    const daysInMonth = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      0,
    ).getDate();
    const daysUsed = currentDate.getDate() - startDate.getDate();
    const daysRemaining = daysInMonth - daysUsed;

    const currentPrice = await this.calculateSubscriptionPrice(
      company.id,
      company.subscriptionPlan,
    );

    const dailyRate = currentPrice / daysInMonth;
    const proratedAmount = dailyRate * daysRemaining;

    return proratedAmount;
  }

  async getBillingInfo(companyId: number) {
    const company = await this.companyService.findOne(companyId);
   
    let billingInfo:
      | { subscriptionPlan: string; billingAmount: number; billingDueDate: Date }
      | { message: string };
    if (company.subscriptionPlan !== 'free tier') {

      const subscriptionStartDate = company.subscriptionStartDate
      ? new Date(company.subscriptionStartDate)
      : null;
      
      billingInfo = {
        subscriptionPlan: company.subscriptionPlan,
        billingAmount: company.billingAmount,
        billingDueDate: subscriptionStartDate
          ? new Date(
              new Date(subscriptionStartDate).setMonth(
                subscriptionStartDate.getMonth() + 1,
              ),
            )
          : new Date(),
      };
    } else {
      billingInfo = {
        message: 'No billing information available for free tier subscription',
      };
    }
    return billingInfo;
  }
}
