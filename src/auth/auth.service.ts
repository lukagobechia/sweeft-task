import { BadRequestException, Injectable } from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { CompanyService } from 'src/company/company.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { plainToClass } from 'class-transformer';
import { Company } from 'src/company/entities/company.entity';
import { EmployeeService } from 'src/employee/employee.service';
import { EmailSenderService } from 'src/email-sender/email-sender.service';
import { Employee } from 'src/employee/entities/employee.entity';
import { SetPasswordDto } from './dto/set-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
@Injectable()
export class AuthService {
  constructor(
    private readonly companyService: CompanyService,
    private readonly employeeService: EmployeeService,
    private readonly jwtService: JwtService,
    private readonly emailSenderService: EmailSenderService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const existUser = await this.companyService.findCompanyByEmail(
      signUpDto.email,
    );
    if (existUser)
      throw new BadRequestException('User with that email already exist');

    const hashedPassword = await bcrypt.hash(signUpDto.password, 10);

    const newUser = await this.companyService.create({
      ...signUpDto,
      password: hashedPassword
    });

    const payload = {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    };

    const accessToken = await this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    await this.emailSenderService.sendActivationEmailToCompany(
      newUser,
      accessToken,
    );

    return plainToClass(Company, newUser);
  }

  async signIn(signInDto: SignInDto) {
    let user: any;
    let role: string;

    user = await this.companyService.findCompanyByEmail(signInDto.email);
    if (user) {
      role = 'company';
    } else {
      user = await this.employeeService.findEmployeeByEmail(signInDto.email);
      if (user) {
        role = 'employee';
      }
    }

    if (!user) {
      throw new BadRequestException('Email or password is incorrect');
    }

    if (!signInDto.password || !user.password) {
      throw new BadRequestException('Email or password is incorrect');
    }

    const isPasswordMatch = await bcrypt.compare(
      signInDto.password,
      user.password,
    );

    if (!isPasswordMatch)
      throw new BadRequestException('Email or password is incorrect');

    let payload: any;

    if (user.role === 'employee') {
      payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        companyId: user.company.id,
      };
    } else {
      payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      };
    }

    const accessToken = await this.jwtService.sign(payload, {
      expiresIn: '1h',
    });

    if (!user.isActive) {
      if (user.role === 'employee') {
        await this.emailSenderService.resendActivationEmailToEmployee(
          user,
          accessToken,
        );
        return { message: 'Please Check your email and activate your account' };
      } else if (user.role === 'company') {
        await this.emailSenderService.sendActivationEmailToCompany(
          user,
          accessToken,
        );
        throw new BadRequestException(
          'Please Check your email and activate your account',
        );
      }
    }
    return { accessToken };
  }

  async confirmEmail(token: string): Promise<{ token: string | null }> {
    try {
      const payload = this.jwtService.verify(token);
      const { email, role } = payload;
      if (role === 'employee') {
        return { token };
      } else if (role === 'company') {
        await this.companyService.verifyCompany(email);
        return { token: null };
      } else {
        throw new BadRequestException('Invalid token type');
      }
    } catch (error) {
      throw new BadRequestException('Invalid or expired token');
    }
  }

  async setPassword(setPasswordDto: SetPasswordDto) {
    const { token, password } = setPasswordDto;

    try {
      const payload = this.jwtService.verify(token);

      const employee = await this.employeeService.findEmployeeInCompany(
        payload.id,
        payload.companyId,
      );
      const companyId = payload.companyId;

      const hashedPassword = await bcrypt.hash(password, 10);
      employee.password = hashedPassword;
      employee.isActive = true;

      await this.employeeService.updateEmployeeInCompany(
        employee.id,
        companyId,
        employee,
      );

      return 'Password set successfully, account activated';
    } catch (error) {
      throw new BadRequestException('Invalid or expired token');
    }
  }
  async requestResetPassword(email: string) {
    const user = await this.companyService.findCompanyByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const resetToken = await this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    await this.emailSenderService.sendResetPasswordEmail(user, resetToken);

    return 'Reset password link sent to your email';
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, password } = resetPasswordDto;

    try {
      const payload = this.jwtService.verify(token);

      const user = await this.companyService.findOne(payload.id);

      const hashedPassword = bcrypt.hashSync(password, 10);
      user.password = hashedPassword;

      await this.companyService.update(payload.id, user);

      return 'Password reset successfully';
    } catch (error) {
      throw new BadRequestException('Invalid or expired token');
    }
  }
}
