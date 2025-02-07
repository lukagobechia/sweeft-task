import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { CompanyModule } from 'src/company/company.module';
import { SubscriptionGuard } from './subscription.guard';
import { Company } from 'src/company/entities/company.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports: [
    CompanyModule,
    TypeOrmModule.forFeature([Company]),
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService, SubscriptionGuard],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}