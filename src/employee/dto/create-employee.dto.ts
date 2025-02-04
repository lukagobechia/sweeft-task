import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

const passwordRegEx =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[@$!%*?&])[A-Za-zd@$!%*?&]{8,20}$/;

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'First name must have at least 2 characters!' })
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Last name must have at least 2 characters!' })
  lastName: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty({ message: 'Please provide an email!' })
  email: string;
}
