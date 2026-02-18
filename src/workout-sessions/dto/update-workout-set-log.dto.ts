import { PartialType } from '@nestjs/swagger';
import { CreateWorkoutSetLogDto } from './create-workout-set-log.dto';

export class UpdateWorkoutSetLogDto extends PartialType(CreateWorkoutSetLogDto) {}

