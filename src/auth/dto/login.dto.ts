// src/auth/dto/login.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // ← import this

export class LoginDto {
  @ApiProperty({
    description: 'Email, username, or phone number',
    example: 'user@example.com',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Please provide email, username, or phone number' })
  identifier: string;

  @ApiProperty({
    description: 'User password',
    example: 'StrongPass123!',
    minLength: 6,
    required: true,
  })
  @IsString()
  password: string;
}
