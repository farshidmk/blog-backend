import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';

@Injectable()
export class ExercisesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateExerciseDto) {
    try {
      return await this.prisma.exercise.create({ data });
    } catch (e) {
      if (e.code === 'P2002') {
        throw new BadRequestException('Duplicate sourceUrl');
      }
      throw e;
    }
  }

  async findAll(skip = 0, take = 20, search?: string) {
    const where = search
      ? {
          name: {
            contains: search,
            mode: 'insensitive' as const,
          },
        }
      : undefined;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.exercise.findMany({
        where,
        orderBy: { id: 'asc' },
        skip,
        take,
      }),
      this.prisma.exercise.count({ where }),
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
    const item = await this.prisma.exercise.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('Exercise not found');
    }
    return item;
  }

  async update(id: number, data: UpdateExerciseDto) {
    try {
      return await this.prisma.exercise.update({
        where: { id },
        data,
      });
    } catch (e) {
      if (e.code === 'P2025') {
        throw new NotFoundException('Exercise not found');
      }
      if (e.code === 'P2002') {
        throw new BadRequestException('Duplicate sourceUrl');
      }
      throw e;
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.exercise.delete({ where: { id } });
    } catch (e) {
      if (e.code === 'P2025') {
        throw new NotFoundException('Exercise not found');
      }
      throw e;
    }
  }
}

