import { Module } from '@nestjs/common';
import { UserWorkoutPlansController } from './user-workout-plans.controller';
import { UserWorkoutPlansService } from './user-workout-plans.service';

@Module({
  controllers: [UserWorkoutPlansController],
  providers: [UserWorkoutPlansService],
})
export class UserWorkoutPlansModule {}

