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
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { RequestResetPasswordDto } from './dto/request-reset-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('sign-in')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Get('confirm-email')
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
  async setPassword(@Body() setPasswordDto: SetPasswordDto) {
    return this.authService.setPassword(setPasswordDto);
  }

  @Post('request-reset-password')
  async requestResetPassword(@Body() resetPasswordDto: RequestResetPasswordDto) {
    return this.authService.requestResetPassword(resetPasswordDto.email);
  }

  @Get('reset-password')
  async resetPasswordPage(@Query('token') token: string, @Res() res) {
    try {
      return res.render('reset-password', { token });
    } catch (error) {
      throw new BadRequestException('Invalid or expired token');
    }
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
