import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { WorkoutPlanExerciseInputDto } from './workout-plan-exercise-input.dto';

export class CreateWorkoutPlanDto {
  @ApiProperty({ example: 'Upper/Lower Beginner' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: '4-week beginner plan' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 3, description: 'Number of training days per week' })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(14)
  daysPerWeek?: number;

  @ApiPropertyOptional({ type: [WorkoutPlanExerciseInputDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => WorkoutPlanExerciseInputDto)
  exercises?: WorkoutPlanExerciseInputDto[];
}

