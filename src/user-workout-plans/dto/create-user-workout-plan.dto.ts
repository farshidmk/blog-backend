import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsInt, IsOptional } from 'class-validator';

export class CreateUserWorkoutPlanDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  userId: number;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsInt()
  planId: number;

  @ApiProperty({ example: '2026-02-18T00:00:00.000Z' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ example: '2026-03-18T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

