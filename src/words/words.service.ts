import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async findAll() {
    return this.prisma.word.findMany({
      include: { wordCategory: true },
      orderBy: { id: 'asc' },
    });
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
