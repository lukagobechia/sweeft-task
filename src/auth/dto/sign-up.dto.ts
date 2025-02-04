import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
  IsOptional,
  IsBoolean
} from 'class-validator';

const passwordRegEx =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

export class SignUpDto {
  @IsString()
  @MinLength(2, { message: 'Name must have al last 2 characters!' })
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty({ message: 'Please provide an email!' })
  email: string;

  @IsNotEmpty()
  @Matches(passwordRegEx, {
    message: `Password must contain Minimum 8 and maximum 20 characters, at least one uppercase letter, one lowercase letter, one number and one special character`,
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  industry: string;

  @IsString()
  @IsOptional()
  @IsEnum(['free tier', 'basic', 'Premium'])
  plan: string;

  @IsOptional()
  @IsBoolean()
  isActive: boolean;
}
