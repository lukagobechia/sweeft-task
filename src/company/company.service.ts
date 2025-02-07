import {
  HttpException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { CreateEmployeeDto } from 'src/employee/dto/create-employee.dto';
import { EmployeeService } from 'src/employee/employee.service';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company) private companyRepository: Repository<Company>,
    @Inject(forwardRef(() => EmployeeService))
    private employeeService: EmployeeService,
  ) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    try {
      const company = this.companyRepository.create(createCompanyDto);
      if (!company) throw new HttpException('Error creating company', 500);
      const newCompay = this.companyRepository.save(company);

      return plainToClass(Company, newCompay);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error creating company: ' + error.message,
      );
    }
  }

  async findAll(): Promise<Company[]> {
    try {
      const companies = await this.companyRepository.find({relations: ['employees', 'uploadedFiles']});
      return companies;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching companies: ' + error.message,
      );
    }
  }

  async findOne(id: number): Promise<Company> {
    try {
      const company = await this.companyRepository.findOne({
        where: { id },
        relations: ['employees', 'uploadedFiles', 'uploadedFiles.uploadedBy'],
        select: {
          employees: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isActive: true,
          }
        },
      });
      if (!company) throw new NotFoundException('Company not found');
      return plainToClass(Company, company);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching company 5: ' + error.message,
      );
    }
  }

  async update(
    id: number,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    try {
      const company = await this.companyRepository.preload({
        id,
        ...updateCompanyDto,
      });
      if (!company) throw new NotFoundException('Company not found');
      const updatedCompany = await this.companyRepository.save(company);
      return plainToClass(Company, updatedCompany);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error updating company: ' + error.message,
      );
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    const company = await this.companyRepository.findOne({ where: { id } });
    if (!company) throw new NotFoundException('Company not found');

    try {
      const result = await this.companyRepository.delete(id);
      if (result.affected === 0)
        throw new NotFoundException('Company not found');

      return { message: 'User deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error deleting user: ' + error.message,
      );
    }
  }

  async findCompanyByEmail(email: string): Promise<Company | null> {
    try {
      const company = await this.companyRepository.findOne({
        where: { email },
      });
      return company;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching company 5: ' + error.message,
      );
    }
  }

  async verifyCompany(email: string): Promise<void> {
    const company = await this.companyRepository.findOne({ where: { email } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    company.isActive = true;
    await this.companyRepository.save(company);
  }

  async getCurrentCompany(id: number): Promise<Company> {
    const company = await this.findOne(id);
    return plainToClass(Company, company);
  }

  // employee management
  addEmployee(CreateEmployeeDto: CreateEmployeeDto, companyId: number) {
    return this.employeeService.addEmployee(CreateEmployeeDto, companyId);
  }
  getEmployees(companyId: number) {
    return this.employeeService.findAllEmployeesInCompany(companyId);
  }
  getEmployee(companyId: number, userId: number) {
    return this.employeeService.findEmployeeInCompany(companyId, userId);
  }

  removeEmployee(companyId: number, userId: number) {
    return this.employeeService.removeEmployeeInCompany(companyId, userId);
  }
}
