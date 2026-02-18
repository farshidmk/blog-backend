import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, ValidateNested } from 'class-validator';
import { WorkoutPlanExerciseInputDto } from './workout-plan-exercise-input.dto';

export class ReplaceWorkoutPlanExercisesDto {
  @ApiProperty({ type: [WorkoutPlanExerciseInputDto] })
  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => WorkoutPlanExerciseInputDto)
  exercises: WorkoutPlanExerciseInputDto[];
}

