import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const passwordRegEx =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

export class CreateCompanyDto {
  @ApiProperty({
    description: 'The name of the company.',
    type: String,
  })
  @IsString()
  @MinLength(2, { message: 'Name must have at least 2 characters!' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The email address of the company.',
    type: String,
  })
  @IsString()
  @IsEmail()
  @IsNotEmpty({ message: 'Please provide an email!' })
  email: string;

  @ApiProperty({
    description: 'The password for the company account.',
    type: String,
  })
  @IsNotEmpty()
  @Matches(passwordRegEx, {
    message:
      'Password must contain at least 8 and maximum 20 characters, one uppercase letter, one lowercase letter, one number, and one special character.',
  })
  password: string;

  @ApiProperty({
    description: 'The country in which the company operates.',
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
    description: 'Whether the company is active.',
    type: Boolean,
  })
  @IsNotEmpty()
  isActive: boolean;
}
