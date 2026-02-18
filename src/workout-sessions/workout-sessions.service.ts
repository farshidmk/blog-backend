import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkoutSessionDto } from './dto/create-workout-session.dto';
import { CreateWorkoutSetLogDto } from './dto/create-workout-set-log.dto';
import { FinishWorkoutSessionDto } from './dto/finish-workout-session.dto';
import { UpdateWorkoutSetLogDto } from './dto/update-workout-set-log.dto';

@Injectable()
export class WorkoutSessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, data: CreateWorkoutSessionDto) {
    if (data.planId) {
      const plan = await this.prisma.workoutPlan.findUnique({
        where: { id: data.planId },
        select: { id: true },
      });
      if (!plan) {
        throw new BadRequestException('Invalid planId');
      }
    }

    return this.prisma.workoutSession.create({
      data: {
        userId,
        planId: data.planId,
        dayIndex: data.dayIndex,
        notes: data.notes,
      },
    });
  }

  async findMine(userId: number, skip = 0, take = 20) {
    const [data, total] = await this.prisma.$transaction([
      this.prisma.workoutSession.findMany({
        where: { userId },
        orderBy: { startedAt: 'desc' },
        skip,
        take,
        include: {
          plan: true,
          setLogs: {
            orderBy: [{ exerciseId: 'asc' }, { setNumber: 'asc' }],
          },
        },
      }),
      this.prisma.workoutSession.count({ where: { userId } }),
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

  async findOneMine(userId: number, id: number) {
    const item = await this.prisma.workoutSession.findUnique({
      where: { id },
      include: {
        plan: true,
        setLogs: {
          orderBy: [{ exerciseId: 'asc' }, { setNumber: 'asc' }],
          include: {
            exercise: {
              select: { id: true, name: true, primaryMuscle: true },
            },
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Workout session not found');
    }
    if (item.userId !== userId) {
      throw new ForbiddenException('You do not have access to this session');
    }

    return item;
  }

  async finish(userId: number, id: number, data: FinishWorkoutSessionDto) {
    await this.findOneMine(userId, id);

    return this.prisma.workoutSession.update({
      where: { id },
      data: {
        finishedAt: new Date(),
        notes: data.notes,
      },
    });
  }

  async addSetLog(userId: number, sessionId: number, data: CreateWorkoutSetLogDto) {
    const session = await this.prisma.workoutSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) {
      throw new NotFoundException('Workout session not found');
    }
    if (session.userId !== userId) {
      throw new ForbiddenException('You do not have access to this session');
    }

    const exercise = await this.prisma.exercise.findUnique({
      where: { id: data.exerciseId },
      select: { id: true },
    });
    if (!exercise) {
      throw new BadRequestException('Invalid exerciseId');
    }

    if (data.planExerciseId) {
      const planExercise = await this.prisma.workoutPlanExercise.findUnique({
        where: { id: data.planExerciseId },
        select: { id: true, planId: true },
      });
      if (!planExercise) {
        throw new BadRequestException('Invalid planExerciseId');
      }
      if (session.planId && session.planId !== planExercise.planId) {
        throw new BadRequestException(
          'planExerciseId does not belong to this session plan',
        );
      }
    }

    try {
      return await this.prisma.workoutSetLog.create({
        data: {
          sessionId,
          exerciseId: data.exerciseId,
          planExerciseId: data.planExerciseId,
          setNumber: data.setNumber,
          reps: data.reps,
          weightKg: data.weightKg,
          notes: data.notes,
        },
      });
    } catch (e) {
      if (e.code === 'P2002') {
        throw new BadRequestException(
          'Duplicate setNumber for this exercise in session',
        );
      }
      throw e;
    }
  }

  async listSetLogs(userId: number, sessionId: number) {
    await this.findOneMine(userId, sessionId);

    return this.prisma.workoutSetLog.findMany({
      where: { sessionId },
      orderBy: [{ exerciseId: 'asc' }, { setNumber: 'asc' }],
      include: {
        exercise: {
          select: { id: true, name: true, primaryMuscle: true },
        },
      },
    });
  }

  async updateSetLog(userId: number, setLogId: number, data: UpdateWorkoutSetLogDto) {
    const existing = await this.prisma.workoutSetLog.findUnique({
      where: { id: setLogId },
      include: { session: true },
    });

    if (!existing) {
      throw new NotFoundException('Workout set log not found');
    }
    if (existing.session.userId !== userId) {
      throw new ForbiddenException('You do not have access to this set log');
    }

    if (data.exerciseId) {
      const exercise = await this.prisma.exercise.findUnique({
        where: { id: data.exerciseId },
        select: { id: true },
      });
      if (!exercise) {
        throw new BadRequestException('Invalid exerciseId');
      }
    }

    try {
      return await this.prisma.workoutSetLog.update({
        where: { id: setLogId },
        data,
      });
    } catch (e) {
      if (e.code === 'P2002') {
        throw new BadRequestException(
          'Duplicate setNumber for this exercise in session',
        );
      }
      throw e;
    }
  }
}

