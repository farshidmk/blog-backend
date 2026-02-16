import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // ← import this

export class RegisterDto {
  @ApiProperty({
    description: 'User email address (must be unique)',
    example: 'user@example.com',
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password (minimum 6 characters)',
    example: 'StrongPass123!',
    minLength: 6,
    required: true,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Optional first name',
    example: 'John',
    required: false,
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    description: 'Optional last name',
    example: 'Doe',
    required: false,
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    description: 'Optional username (must be unique if provided)',
    example: 'johndoe',
    required: false,
  })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({
    description: 'Optional phone number (international format recommended)',
    example: '+12025550123',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(
    /^\+?[1-9]\d{1,14}$|^(\+\d{1,3}[- ]?)?\(?\d{1,4}\)?[- ]?\d{1,4}[- ]?\d{1,4}[- ]?\d{1,9}$/,
    {
      message: 'Invalid phone number format',
    },
  )
  phone?: string;
}
