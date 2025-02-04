import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { IsEmployee } from 'src/auth/guards/role.guard';

@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get('current')
  @UseGuards(AuthGuard, IsEmployee)
  getCurrentEmployee(@Req() req) {
    const userId = req.user.id;
    console.log('userId', userId);
    return this.employeeService.getCurrentEmployee(userId);
  }
}
