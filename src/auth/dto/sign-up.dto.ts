import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const passwordRegEx =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

export class SignUpDto {
  @ApiProperty({
    description: 'The name of the user.',
    type: String,
  })
  @IsString()
  @MinLength(2, { message: 'Name must have at least 2 characters!' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The email address of the user.',
    type: String,
  })
  @IsString()
  @IsEmail()
  @IsNotEmpty({ message: 'Please provide an email!' })
  email: string;

  @ApiProperty({
    description: 'The password of the user. It must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.',
    type: String,
  })
  @IsNotEmpty()
  @Matches(passwordRegEx, {
    message:
      'Password must contain at least 8 and maximum 20 characters, one uppercase letter, one lowercase letter, one number, and one special character.',
  })
  password: string;

  @ApiProperty({
    description: 'The country of the company.',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({
    description: 'The industry of the company.',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  industry: string;

  @ApiProperty({
    description: 'The subscription plan of the company.',
    type: String,
    enum: ['free tier', 'basic', 'Premium'],
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsEnum(['free tier', 'basic', 'Premium'])
  plan: string;

  @ApiProperty({
    description: 'Whether the company is active.',
    type: Boolean,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive: boolean;
}
