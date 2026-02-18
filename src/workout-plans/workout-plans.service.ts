import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto';
import { ReplaceWorkoutPlanExercisesDto } from './dto/replace-workout-plan-exercises.dto';
import { WorkoutPlanExerciseInputDto } from './dto/workout-plan-exercise-input.dto';
import { UpdateWorkoutPlanDto } from './dto/update-workout-plan.dto';

@Injectable()
export class WorkoutPlansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateWorkoutPlanDto, createdById: number) {
    await this.validateExercisesExist(data.exercises ?? []);

    try {
      return await this.prisma.workoutPlan.create({
        data: {
          title: data.title,
          description: data.description,
          daysPerWeek: data.daysPerWeek,
          createdById,
          planExercises:
            data.exercises && data.exercises.length > 0
              ? {
                  create: data.exercises,
                }
              : undefined,
        },
        include: {
          planExercises: {
            orderBy: [{ dayIndex: 'asc' }, { order: 'asc' }],
            include: {
              exercise: {
                select: { id: true, name: true, primaryMuscle: true },
              },
            },
          },
        },
      });
    } catch (e) {
      if (e.code === 'P2002') {
        throw new BadRequestException('Duplicate exercise order or assignment');
      }
      throw e;
    }
  }

  async findAll(skip = 0, take = 20) {
    const [data, total] = await this.prisma.$transaction([
      this.prisma.workoutPlan.findMany({
        skip,
        take,
        orderBy: { id: 'asc' },
        include: {
          planExercises: {
            orderBy: [{ dayIndex: 'asc' }, { order: 'asc' }],
            include: {
              exercise: {
                select: { id: true, name: true, primaryMuscle: true },
              },
            },
          },
        },
      }),
      this.prisma.workoutPlan.count(),
    ]);

    return {
      data,
      meta: {
        total,
        skip,
        take,
        count: data.length,
      },
    };
  }

  async findOne(id: number) {
    const item = await this.prisma.workoutPlan.findUnique({
      where: { id },
      include: {
        planExercises: {
          orderBy: [{ dayIndex: 'asc' }, { order: 'asc' }],
          include: {
            exercise: {
              select: { id: true, name: true, primaryMuscle: true },
            },
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Workout plan not found');
    }
    return item;
  }

  async update(id: number, data: UpdateWorkoutPlanDto) {
    const { exercises: _ignoredExercises, ...planData } = data;

    try {
      return await this.prisma.workoutPlan.update({
        where: { id },
        data: planData,
      });
    } catch (e) {
      if (e.code === 'P2025') {
        throw new NotFoundException('Workout plan not found');
      }
      throw e;
    }
  }

  async replaceExercises(id: number, data: ReplaceWorkoutPlanExercisesDto) {
    await this.findOne(id);
    await this.validateExercisesExist(data.exercises);

    try {
      await this.prisma.$transaction([
        this.prisma.workoutPlanExercise.deleteMany({
          where: { planId: id },
        }),
        this.prisma.workoutPlanExercise.createMany({
          data: data.exercises.map((item) => ({
            ...item,
            planId: id,
          })),
        }),
      ]);
    } catch (e) {
      if (e.code === 'P2002') {
        throw new BadRequestException('Duplicate exercise order or assignment');
      }
      throw e;
    }

    return this.findOne(id);
  }

  async remove(id: number) {
    try {
      return await this.prisma.workoutPlan.delete({
        where: { id },
      });
    } catch (e) {
      if (e.code === 'P2025') {
        throw new NotFoundException('Workout plan not found');
      }
      throw e;
    }
  }

  private async validateExercisesExist(exercises: WorkoutPlanExerciseInputDto[]) {
    if (exercises.length === 0) {
      return;
    }

    const uniqueIds = Array.from(new Set(exercises.map((item) => item.exerciseId)));
    const count = await this.prisma.exercise.count({
      where: { id: { in: uniqueIds } },
    });

    if (count !== uniqueIds.length) {
      throw new BadRequestException('One or more exerciseId values are invalid');
    }
  }
}

