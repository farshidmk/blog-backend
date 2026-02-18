import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserWorkoutPlanDto } from './dto/create-user-workout-plan.dto';
import { UpdateUserWorkoutPlanDto } from './dto/update-user-workout-plan.dto';

@Injectable()
export class UserWorkoutPlansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserWorkoutPlanDto) {
    await this.ensureUserAndPlan(data.userId, data.planId);
    this.validateDateRange(data.startDate, data.endDate);

    if (data.isActive ?? true) {
      return this.prisma.$transaction(async (tx) => {
        await tx.userWorkoutPlan.updateMany({
          where: { userId: data.userId, isActive: true },
          data: { isActive: false },
        });

        return tx.userWorkoutPlan.create({
          data: {
            userId: data.userId,
            planId: data.planId,
            startDate: new Date(data.startDate),
            endDate: data.endDate ? new Date(data.endDate) : null,
            isActive: true,
          },
          include: {
            plan: true,
            user: {
              select: { id: true, email: true, username: true },
            },
          },
        });
      });
    }

    return this.prisma.userWorkoutPlan.create({
      data: {
        userId: data.userId,
        planId: data.planId,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        isActive: false,
      },
      include: {
        plan: true,
        user: {
          select: { id: true, email: true, username: true },
        },
      },
    });
  }

  async findAll(skip = 0, take = 20) {
    const [data, total] = await this.prisma.$transaction([
      this.prisma.userWorkoutPlan.findMany({
        skip,
        take,
        orderBy: [{ userId: 'asc' }, { startDate: 'desc' }],
        include: {
          plan: true,
          user: {
            select: { id: true, email: true, username: true },
          },
        },
      }),
      this.prisma.userWorkoutPlan.count(),
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

  async findMine(userId: number) {
    return this.prisma.userWorkoutPlan.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' },
      include: {
        plan: {
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
        },
      },
    });
  }

  async findMyActive(userId: number) {
    const now = new Date();

    return this.prisma.userWorkoutPlan.findFirst({
      where: {
        userId,
        isActive: true,
        startDate: { lte: now },
        OR: [{ endDate: null }, { endDate: { gte: now } }],
      },
      orderBy: { startDate: 'desc' },
      include: {
        plan: {
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
        },
      },
    });
  }

  async update(id: number, data: UpdateUserWorkoutPlanDto) {
    const existing = await this.prisma.userWorkoutPlan.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('User workout plan not found');
    }

    const userId = data.userId ?? existing.userId;
    const planId = data.planId ?? existing.planId;
    await this.ensureUserAndPlan(userId, planId);

    const startDate = data.startDate ?? existing.startDate.toISOString();
    const endDate =
      data.endDate === undefined ? existing.endDate?.toISOString() : data.endDate;
    this.validateDateRange(startDate, endDate);

    if (data.isActive === true) {
      await this.prisma.userWorkoutPlan.updateMany({
        where: {
          userId,
          isActive: true,
          id: { not: id },
        },
        data: { isActive: false },
      });
    }

    return this.prisma.userWorkoutPlan.update({
      where: { id },
      data: {
        userId,
        planId,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isActive: data.isActive ?? existing.isActive,
      },
      include: {
        plan: true,
        user: {
          select: { id: true, email: true, username: true },
        },
      },
    });
  }

  async remove(id: number) {
    try {
      return await this.prisma.userWorkoutPlan.delete({
        where: { id },
      });
    } catch (e) {
      if (e.code === 'P2025') {
        throw new NotFoundException('User workout plan not found');
      }
      throw e;
    }
  }

  private async ensureUserAndPlan(userId: number, planId: number) {
    const [user, plan] = await this.prisma.$transaction([
      this.prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
      this.prisma.workoutPlan.findUnique({
        where: { id: planId },
        select: { id: true },
      }),
    ]);

    if (!user) {
      throw new BadRequestException('Invalid userId');
    }
    if (!plan) {
      throw new BadRequestException('Invalid planId');
    }
  }

  private validateDateRange(startDate: string, endDate?: string) {
    if (!endDate) {
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      throw new BadRequestException('endDate must be greater than startDate');
    }
  }
}

