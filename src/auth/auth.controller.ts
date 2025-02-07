import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Res,
  Render,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { RequestResetPasswordDto } from './dto/request-reset-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  @ApiOperation({ summary: 'Sign up a new user' })
  @ApiResponse({ status: 201, description: 'User successfully signed up' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('sign-in')
  @ApiOperation({ summary: 'Sign in a user' })
  @ApiResponse({ status: 200, description: 'User successfully signed in' })
  @ApiResponse({ status: 400, description: 'Invalid credentials' })
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Get('confirm-email')
  @ApiOperation({ summary: 'Confirm user email via token' })
  @ApiResponse({ status: 200, description: 'Email confirmed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async confirmEmail(@Query('token') token: string, @Res() res) {
    try {
      const data = await this.authService.confirmEmail(token);
      if (data.token) {
        return res.render('set-password', { token: data.token });
      } else {
        return res.send('Account activated successfully');
      }
    } catch (error) {
      throw new BadRequestException('Invalid or expired token');
    }
  }

  @Post('set-password')
  @ApiOperation({ summary: 'Set password for the user' })
  @ApiResponse({ status: 200, description: 'Password successfully set' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async setPassword(@Body() setPasswordDto: SetPasswordDto) {
    return this.authService.setPassword(setPasswordDto);
  }

  @Post('request-reset-password')
  @ApiOperation({ summary: 'Request password reset link' })
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  @ApiResponse({ status: 400, description: 'Invalid email' })
  async requestResetPassword(@Body() resetPasswordDto: RequestResetPasswordDto) {
    return this.authService.requestResetPassword(resetPasswordDto.email);
  }

  @Get('reset-password')
  @ApiOperation({ summary: 'Show password reset page' })
  @ApiResponse({ status: 200, description: 'Password reset page rendered' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPasswordPage(@Query('token') token: string, @Res() res) {
    try {
      return res.render('reset-password', { token });
    } catch (error) {
      throw new BadRequestException('Invalid or expired token');
    }
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset user password' })
  @ApiResponse({ status: 200, description: 'Password successfully reset' })
  @ApiResponse({ status: 400, description: 'Invalid token or password' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
