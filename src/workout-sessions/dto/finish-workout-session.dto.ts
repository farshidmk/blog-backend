import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FinishWorkoutSessionDto {
  @ApiPropertyOptional({ example: 'Session completed with reduced rest time' })
  @IsOptional()
  @IsString()
  notes?: string;
}

