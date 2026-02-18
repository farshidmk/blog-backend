import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateWorkoutSetLogDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  exerciseId: number;

  @ApiPropertyOptional({ example: 5 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  planExerciseId?: number;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  setNumber: number;

  @ApiPropertyOptional({ example: 10 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(500)
  reps?: number;

  @ApiPropertyOptional({ example: 20.5 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(999.99)
  weightKg?: number;

  @ApiPropertyOptional({ example: 'Last rep was close to failure' })
  @IsOptional()
  @IsString()
  notes?: string;
}

