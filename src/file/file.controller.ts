import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Body,
  Query,
  Param,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { IsEmployee } from 'src/auth/guards/role.guard';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CompanyService } from 'src/company/company.service';
import { FileService } from './file.service';
import { SubscriptionGuard } from 'src/subscription/subscription.guard';
import { RestrictAccess } from 'src/subscription/restrictAccess.guard';

@Controller('file')
export class FileController {
  constructor(
    private readonly filesService: FileService,
    private readonly companyService: CompanyService,
  ) {}

  @Post('/uploadFile')
  @UseGuards(AuthGuard, IsEmployee,SubscriptionGuard, RestrictAccess)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() files: Express.Multer.File,
    @Req() req,
    @Body() body: { restricted: string; allowedEmployees: string[] },
  ) {
    const { restricted, allowedEmployees } = body;
    const isRestricted = restricted === 'true';
    const user = req.user;

    const fileUrl = await this.filesService.uploadFile(
      files,
      user.id,
      user.companyId,
      isRestricted,
      allowedEmployees,
    );

    return { message: 'File uploaded successfully', fileUrl };
  }

  @Patch('permissions')
  @UseGuards(AuthGuard, IsEmployee)
  async updateFilePermissions(
    @Req() req,
    @Body('fileId') fileId: number,
    @Body('restricted') restricted: boolean,
    @Body('allowedEmployees') allowedEmployees: string[],
  ) {
    const user = req.user;

    await this.filesService.updateFilePermissions(
      fileId,
      user.companyId,
      user.id,
      restricted,
      allowedEmployees,
    );

    return { message: 'File permissions updated successfully' };
  }

  @Delete(':id')
  @UseGuards(AuthGuard, IsEmployee)
  async deleteFile(@Req() req: any, @Param('id') id: string) {
    const fileId = parseInt(id, 10);
    console.log('fileId', fileId);
    const user = req.user;

    await this.filesService.deleteFile(user.companyId, fileId);

    return { message: 'File deleted successfully' };
  }

  @Get()
  @UseGuards(AuthGuard, IsEmployee)
  async getCompanyFiles(@Req() req) {
    const user = req.user;
    return this.filesService.getCompanyFiles(user);
  }
}
