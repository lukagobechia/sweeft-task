import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  Res,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { IsCompany } from 'src/auth/guards/role.guard';
import { EmployeeService } from 'src/employee/employee.service';
import { CreateEmployeeDto } from 'src/employee/dto/create-employee.dto';
import { SubscriptionGuard } from 'src/subscription/subscription.guard';
import { RestrictAccess } from 'src/subscription/restrictAccess.guard';

@Controller('company')
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
    private EmployeeService: EmployeeService,
  ) {}

  // company 
  @Get('current')
  @UseGuards(AuthGuard, IsCompany)
  getCurrentCompany(@Req() req) {
    const companyId = req.user.id;
    console.log('companyId', companyId);
    return this.companyService.getCurrentCompany(companyId);
  }

  @Patch()
  @UseGuards(AuthGuard, IsCompany)
  update(@Body() updateCompanyDto: UpdateCompanyDto, @Req() req) {
    const companyId = req.user.id;
    return this.companyService.update(companyId, updateCompanyDto);
  }

  @Delete()
  @UseGuards(AuthGuard, IsCompany)
  remove(@Req() req) {
    const companyId = req.user.id;
    return this.companyService.remove(companyId);
  }

  // employee
  @Post('create-employee')
  @UseGuards(AuthGuard, IsCompany, SubscriptionGuard, RestrictAccess)
  addEmployee(@Req() req, @Body() CreateEmployeeDto: CreateEmployeeDto) {
    const companyId = req.user.id;
    return this.companyService.addEmployee(CreateEmployeeDto, companyId);
  }

  @Get('employees')
  @UseGuards(AuthGuard, IsCompany)
  getEmployees(@Req() req) {
    const companyId = req.user.id;
    return this.companyService.getEmployees(companyId);
  }

  @Get('employee/:id')
  @UseGuards(AuthGuard, IsCompany)
  getEmployee(@Param('id') id: string, @Req() req) {
    const companyId = req.user.id;
    return this.companyService.getEmployee(+id, companyId);
  }

  @Delete('employee/:id')
  @UseGuards(AuthGuard, IsCompany)
  removeEmployee(@Param('id') id: string, @Req() req) {
    const companyId = req.user.id;
    return this.companyService.removeEmployee(+id, companyId);
  }
}
