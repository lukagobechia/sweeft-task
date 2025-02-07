import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { IsCompany } from 'src/auth/guards/role.guard';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Patch('upgrade')
  @UseGuards(AuthGuard, IsCompany)
  upgradeSubscription(@Body('subscriptionPlan') subscriptionPlan, @Req() req) {
    const { id } = req.user;
    return this.subscriptionService.upgradeSubscription(id,subscriptionPlan);
  }

  @Patch('downgrade')
  @UseGuards(AuthGuard, IsCompany)
  downgradeSubscription(@Body('subscriptionPlan') subscriptionPlan, @Req() req) {
    const { id } = req.user;
    return this.subscriptionService.downgradeSubscription(id, subscriptionPlan);
  }

  @Get('billing-info')
  @UseGuards(AuthGuard, IsCompany)
  getBillingInfo(@Req() req) {
    const { id } = req.user;
    return this.subscriptionService.getBillingInfo(id);
  } 
}
