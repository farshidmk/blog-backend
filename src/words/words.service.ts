import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWordDto } from './dto/create-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';

@Injectable()
export class WordsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateWordDto) {
    const category = await this.prisma.wordCategory.findUnique({
      where: { id: data.wordCategoryId },
    });

    if (!category) {
      throw new BadRequestException('Invalid wordCategoryId');
    }

    return this.prisma.word.create({
      data: {
        word: data.word,
        difficulty: data.difficulty,
        wordCategoryId: data.wordCategoryId,
      },
      include: { wordCategory: true },
    });
  }

  async findAll(filter: Prisma.WordFindManyArgs = {}) {
    const skip = filter.skip ?? 0;
    const take = filter.take ?? 10;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.word.findMany({
        where: filter.where,
        orderBy: filter.orderBy ?? [{ id: 'asc' }],
        skip,
        take,
        include: { wordCategory: true },
      }),
      this.prisma.word.count({ where: filter.where }),
    ]);

    const data = items.map((item) => ({
      id: item.id,
      word: item.word,
      difficulty: item.difficulty,
      wordCategoryId: item.wordCategoryId,
      wordCategoryName: item.wordCategory.name,
    }));

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
    return this.prisma.word.findUnique({
      where: { id },
      include: { wordCategory: true },
    });
  }

  async update(id: number, data: UpdateWordDto) {
    if (data.wordCategoryId !== undefined) {
      const category = await this.prisma.wordCategory.findUnique({
        where: { id: data.wordCategoryId },
      });
      if (!category) {
        throw new BadRequestException('Invalid wordCategoryId');
      }
    }

    try {
      return await this.prisma.word.update({
        where: { id },
        data,
        include: { wordCategory: true },
      });
    } catch (e) {
      if (e.code === 'P2025') {
        throw new NotFoundException('Word not found');
      }
      throw e;
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.word.delete({
        where: { id },
        include: { wordCategory: true },
      });
    } catch (e) {
      if (e.code === 'P2025') {
        throw new NotFoundException('Word not found');
      }
      throw e;
    }
  }
}
