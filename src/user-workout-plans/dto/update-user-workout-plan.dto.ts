import { PartialType } from '@nestjs/swagger';
import { CreateUserWorkoutPlanDto } from './create-user-workout-plan.dto';

export class UpdateUserWorkoutPlanDto extends PartialType(
  CreateUserWorkoutPlanDto,
) {}

