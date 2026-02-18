import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { WordsModule } from './words/words.module';
import { WordCategoriesModule } from './word-categories/word-categories.module';
import { ExercisesModule } from './exercises/exercises.module';
import { WorkoutPlansModule } from './workout-plans/workout-plans.module';
import { UserWorkoutPlansModule } from './user-workout-plans/user-workout-plans.module';
import { WorkoutSessionsModule } from './workout-sessions/workout-sessions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule, // global
    UsersModule,
    AuthModule,
    WordsModule,
    WordCategoriesModule,
    ExercisesModule,
    WorkoutPlansModule,
    UserWorkoutPlansModule,
    WorkoutSessionsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
