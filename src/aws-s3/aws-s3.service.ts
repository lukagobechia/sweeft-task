import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';
import { CompanyService } from 'src/company/company.service';
import { EmployeeService } from 'src/employee/employee.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from 'src/file/entities/file.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AwsS3Service {
  private s3: S3Client;
  private bucketName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly companyService: CompanyService,
    private readonly employeeService: EmployeeService,
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
  ) {
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
    const region = this.configService.get<string>('AWS_REGION');
    const bucketName = this.configService.get<string>('AWS_BUCKET_NAME');

    if (!accessKeyId || !secretAccessKey || !region || !bucketName) {
      throw new InternalServerErrorException('AWS credentials, region, or bucket name not set');
    }

    this.bucketName = bucketName;
    this.s3 = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    userId: number,
    companyId: number,
    restricted: boolean,
    allowedEmployees: string[] = [],
  ): Promise<string> {
    const allowedFormats = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!allowedFormats.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file format. Only CSV, XLS, and XLSX are allowed.',
      );
    }

    const fileKey = `${uuid()}-${file.originalname}`;

    const config = {
      Bucket: this.bucketName,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const uploadCommand = new PutObjectCommand(config);
    await this.s3.send(uploadCommand);

    const company = await this.companyService.findOne(companyId);

    const employee = await this.employeeService.findOne(userId);
    if (!employee) {
      throw new BadRequestException('Employee not found');
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
        throw new BadRequestException('One/some employee(s) is not a member of the company');
      }
    }

    const fileEntity = this.fileRepository.create({
      name: file.originalname,
      key: fileKey,
      url: `https://${this.bucketName}.s3.amazonaws.com/${fileKey}`,
      restricted,
      allowedEmployees,
      company,
      uploadedBy: employee,
    });

    await this.fileRepository.save(fileEntity);

    return fileEntity.url;
  }

  async deleteFile(companyId: number, fileId: number): Promise<void> {
    const company = await this.companyService.findOne(companyId);
    if (!company) {
      throw new BadRequestException('Company not found');
    }

    const file = await this.fileRepository.findOne({ where: { id: fileId, company: { id: companyId } } });

    if (!file) {
      throw new BadRequestException('File not found');
    }

    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: file.key,
      }),
    );

    await this.fileRepository.remove(file);
  }
}