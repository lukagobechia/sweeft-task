import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const passwordRegEx =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

export class ResetPasswordDto {
  @ApiProperty({
    description: 'The token used for resetting the password.',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: 'The new password for the user.',
    type: String,
    example: 'Password123!',
  })
  @IsNotEmpty()
  @Matches(passwordRegEx, {
    message:
      'Password must contain at least 8 and maximum 20 characters, one uppercase letter, one lowercase letter, one number, and one special character.',
  })
  password: string;
}
