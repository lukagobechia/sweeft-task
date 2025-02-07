import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EmployeeService } from './employee.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { IsEmployee } from 'src/auth/guards/role.guard';

@ApiTags('Employee')
@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get('current')
  @UseGuards(AuthGuard, IsEmployee)
  @ApiOperation({ summary: 'Get the current employee data' })
  @ApiResponse({ status: 200, description: 'Employee data fetched successfully' })
  getCurrentEmployee(@Req() req) {
    const userId = req.user.id;
    return this.employeeService.getCurrentEmployee(userId);
  }
}
