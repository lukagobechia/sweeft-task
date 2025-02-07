import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { CompanyService } from 'src/company/company.service';
import { AwsS3Service } from 'src/aws-s3/aws-s3.service';
import { EmployeeService } from 'src/employee/employee.service';
import { Company } from 'src/company/entities/company.entity';
import { Employee } from 'src/employee/entities/employee.entity';
import { File } from './entities/file.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
@Injectable()
export class FileService {
  constructor(
    private readonly awsS3Service: AwsS3Service,
    private readonly companyService: CompanyService,
    private readonly employeeService: EmployeeService,
    @InjectRepository(File) private readonly fileRepository: Repository<File>,
  ) {}
  async uploadFile(
    file: Express.Multer.File,
    employeeId: number,
    companyId: number,
    restricted: boolean,
    allowedEmployees: string[],
  ): Promise<string> {
    try {
      return await this.awsS3Service.uploadFile(
        file,
        employeeId,
        companyId,
        restricted,
        allowedEmployees,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Error uploading file: ' + error.message,
      );
    }
  }

  async deleteFile(companyId: number, fileId: number) {
    try {
      return await this.awsS3Service.deleteFile(companyId, fileId);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error uploading file: ' + error.message,
      );
    }
  }

  async updateFilePermissions(
    fileId: number,
    companyId: number,
    userId: number,
    restricted: boolean,
    allowedEmployees: string[],
  ): Promise<void> {
    const company = await this.companyService.findOne(companyId);
    if (!company) {
      throw new BadRequestException('Company not found');
    }

    const file = await this.fileRepository.findOne({ where: { id: fileId, company: { id: companyId } }, relations: ['company', 'uploadedBy'] });
    if (!file) {
      throw new BadRequestException('File not found');
    }

    if (!file.uploadedBy || file.uploadedBy.id !== userId) {
      throw new ForbiddenException('Only the uploader can update the file');
    }
    
    if (restricted) {
      if (typeof allowedEmployees === 'string') {
        allowedEmployees = [allowedEmployees];
      } else if (!Array.isArray(allowedEmployees)) {
        allowedEmployees = [];
      }
    } else {
      allowedEmployees = ['Whole Company'];
    }

    for (const employeeEmail of allowedEmployees) {
      const employee = await this.employeeService.findEmployeeByEmail(employeeEmail);
      if (!employee || employee.company.id !== companyId) {
        throw new BadRequestException('One/some employee(s) is/are not a member of the company');
      }
    }

    file.restricted = restricted;
    file.allowedEmployees = allowedEmployees;

    await this.fileRepository.save(file);
  }

  async getCompanyFiles(user: {
    id: number;
    role: string;
    companyId: number;
    email: string;
  }) {
    try {
      let entity: Company | Employee;
      let visibleFiles: File[];
      if (user.role !== 'employee') {
        entity = await this.companyService.findOne(user.id);
        visibleFiles = entity.uploadedFiles;
      } else {
          entity = await this.companyService.findOne(user.companyId);
        visibleFiles = entity.uploadedFiles.filter(
          (file) =>
            !file.restricted ||
            file.allowedEmployees.includes(user.email) ||
            file.uploadedBy.id === user.id,
        );
      }

      return { message: 'Files retrieved successfully', files: visibleFiles };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error uploading file: ' + error.message,
      );
    }
  }
}
