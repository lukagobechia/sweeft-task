import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Delete,
  Req,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CompanyService } from './company.service';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { IsCompany } from 'src/auth/guards/role.guard';
import { EmployeeService } from 'src/employee/employee.service';
import { CreateEmployeeDto } from 'src/employee/dto/create-employee.dto';
import { SubscriptionGuard } from 'src/subscription/subscription.guard';
import { RestrictAccess } from 'src/subscription/restrictAccess.guard';

@ApiTags('Company')
@Controller('company')
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
    private EmployeeService: EmployeeService,
  ) {}

  @Get('current')
  @UseGuards(AuthGuard, IsCompany)
  @ApiOperation({ summary: 'Get the current company data' })
  @ApiResponse({ status: 200, description: 'Company data fetched successfully' })
  getCurrentCompany(@Req() req) {
    const companyId = req.user.id;
    return this.companyService.getCurrentCompany(companyId);
  }

  @Patch()
  @UseGuards(AuthGuard, IsCompany)
  @ApiOperation({ summary: 'Update company data' })
  @ApiResponse({ status: 200, description: 'Company updated successfully' })
  update(@Body() updateCompanyDto: UpdateCompanyDto, @Req() req) {
    const companyId = req.user.id;
    return this.companyService.update(companyId, updateCompanyDto);
  }

  @Delete()
  @UseGuards(AuthGuard, IsCompany)
  @ApiOperation({ summary: 'Remove the current company' })
  @ApiResponse({ status: 200, description: 'Company removed successfully' })
  remove(@Req() req) {
    const companyId = req.user.id;
    return this.companyService.remove(companyId);
  }

  @Post('create-employee')
  @UseGuards(AuthGuard, IsCompany, SubscriptionGuard, RestrictAccess)
  @ApiOperation({ summary: 'Add a new employee to the company' })
  @ApiResponse({ status: 201, description: 'Employee added successfully' })
  addEmployee(@Req() req, @Body() CreateEmployeeDto: CreateEmployeeDto) {
    const companyId = req.user.id;
    return this.companyService.addEmployee(CreateEmployeeDto, companyId);
  }

  @Get('employees')
  @UseGuards(AuthGuard, IsCompany)
  @ApiOperation({ summary: 'Get a list of employees in the company' })
  @ApiResponse({ status: 200, description: 'List of employees fetched successfully' })
  getEmployees(@Req() req) {
    const companyId = req.user.id;
    return this.companyService.getEmployees(companyId);
  }

  @Get('employee/:id')
  @UseGuards(AuthGuard, IsCompany)
  @ApiOperation({ summary: 'Get specific employee data' })
  @ApiResponse({ status: 200, description: 'Employee data fetched successfully' })
  getEmployee(@Param('id') id: string, @Req() req) {
    const companyId = req.user.id;
    return this.companyService.getEmployee(+id, companyId);
  }

  @Delete('employee/:id')
  @UseGuards(AuthGuard, IsCompany)
  @ApiOperation({ summary: 'Remove an employee from the company' })
  @ApiResponse({ status: 200, description: 'Employee removed successfully' })
  removeEmployee(@Param('id') id: string, @Req() req) {
    const companyId = req.user.id;
    return this.companyService.removeEmployee(+id, companyId);
  }
}
