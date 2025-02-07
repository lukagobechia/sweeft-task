import { Controller, Get, Patch, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { IsCompany } from 'src/auth/guards/role.guard';

@ApiTags('Subscription')
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Patch('upgrade')
  @UseGuards(AuthGuard, IsCompany)
  @ApiOperation({ summary: 'Upgrade company subscription' })
  @ApiResponse({ status: 200, description: 'Subscription upgraded successfully' })
  upgradeSubscription(@Body('subscriptionPlan') subscriptionPlan, @Req() req) {
    const { id } = req.user;
    return this.subscriptionService.upgradeSubscription(id, subscriptionPlan);
  }

  @Patch('downgrade')
  @UseGuards(AuthGuard, IsCompany)
  @ApiOperation({ summary: 'Downgrade company subscription' })
  @ApiResponse({ status: 200, description: 'Subscription downgraded successfully' })
  downgradeSubscription(@Body('subscriptionPlan') subscriptionPlan, @Req() req) {
    const { id } = req.user;
    return this.subscriptionService.downgradeSubscription(id, subscriptionPlan);
  }

  @Get('billing-info')
  @UseGuards(AuthGuard, IsCompany)
  @ApiOperation({ summary: 'Get company billing information' })
  @ApiResponse({ status: 200, description: 'Billing information fetched successfully' })
  getBillingInfo(@Req() req) {
    const { id } = req.user;
    return this.subscriptionService.getBillingInfo(id);
  }
}
