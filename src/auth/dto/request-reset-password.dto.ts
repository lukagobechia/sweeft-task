import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestResetPasswordDto {
  @ApiProperty({
    description: 'The email address of the user requesting password reset.',
    type: String,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
