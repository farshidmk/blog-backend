import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class WorkoutPlanExerciseInputDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  exerciseId: number;

  @ApiProperty({ example: 1, description: 'Training day index inside the plan' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(14)
  dayIndex: number;

  @ApiProperty({ example: 1, description: 'Order of exercise inside day' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  order: number;

  @ApiPropertyOptional({ example: 4 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  targetSets?: number;

  @ApiPropertyOptional({ example: 8 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  targetRepsMin?: number;

  @ApiPropertyOptional({ example: 12 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  targetRepsMax?: number;

  @ApiPropertyOptional({ example: 90 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  targetRestSec?: number;

  @ApiPropertyOptional({ example: 'Slow eccentric' })
  @IsOptional()
  @IsString()
  notes?: string;
}

