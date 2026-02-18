import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateWorkoutSessionDto {
  @ApiPropertyOptional({ example: 1 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  planId?: number;

  @ApiPropertyOptional({ example: 2 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(14)
  dayIndex?: number;

  @ApiPropertyOptional({ example: 'Felt strong today' })
  @IsOptional()
  @IsString()
  notes?: string;
}

