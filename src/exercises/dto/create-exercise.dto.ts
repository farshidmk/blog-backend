import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Difficulty, Muscle } from '@prisma/client';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateExerciseDto {
  @ApiProperty({ example: 'Dumbbell Bench Press' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'https://fitamin.ir/mag/movement/example' })
  @IsOptional()
  @IsUrl()
  sourceUrl?: string;

  @ApiPropertyOptional({ enum: Difficulty, example: Difficulty.medium })
  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @ApiPropertyOptional({ enum: Muscle, example: Muscle.CHEST })
  @IsOptional()
  @IsEnum(Muscle)
  primaryMuscle?: Muscle;

  @ApiPropertyOptional({ enum: Muscle, isArray: true, example: [Muscle.TRICEPS] })
  @IsOptional()
  @IsArray()
  @IsEnum(Muscle, { each: true })
  secondaryMuscles?: Muscle[];

  @ApiPropertyOptional({ example: 'strength' })
  @IsOptional()
  @IsString()
  workoutType?: string;

  @ApiPropertyOptional({ example: 'gym' })
  @IsOptional()
  @IsString()
  place?: string;

  @ApiPropertyOptional({ example: 'dumbbell, bench' })
  @IsOptional()
  @IsString()
  equipment?: string;

  @ApiPropertyOptional({
    example: 'https://fitamin.ir/mag/wp-content/uploads/2022/08/17.mp4',
  })
  @IsOptional()
  @IsUrl()
  videoUrl?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['Lay down on bench', 'Press dumbbells upward'],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  steps?: string[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

