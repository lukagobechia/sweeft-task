import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmployeeDto {
  @ApiProperty({
    description: 'The first name of the employee.',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'First name must have at least 2 characters!' })
  firstName: string;

  @ApiProperty({
    description: 'The last name of the employee.',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Last name must have at least 2 characters!' })
  lastName: string;

  @ApiProperty({
    description: 'The email address of the employee.',
    type: String,
  })
  @IsString()
  @IsEmail()
  @IsNotEmpty({ message: 'Please provide an email!' })
  email: string;
}
