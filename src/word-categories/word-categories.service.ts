import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWordCategoryDto } from './dto/create-word-category.dto';
import { UpdateWordCategoryDto } from './dto/update-word-category.dto';

@Injectable()
export class WordCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateWordCategoryDto) {
    try {
      return await this.prisma.wordCategory.create({ data });
    } catch (e) {
      if (e.code === 'P2002') {
        throw new ConflictException('Word category name already exists');
      }
      throw e;
    }
  }

  async findAll() {
    return this.prisma.wordCategory.findMany({
      include: { _count: { select: { words: true } } },
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.wordCategory.findUnique({
      where: { id },
      include: { words: true },
    });
  }

  async update(id: number, data: UpdateWordCategoryDto) {
    try {
      return await this.prisma.wordCategory.update({
        where: { id },
        data,
        include: { words: true },
      });
    } catch (e) {
      if (e.code === 'P2002') {
        throw new ConflictException('Word category name already exists');
      }
      if (e.code === 'P2025') {
        throw new NotFoundException('Word category not found');
      }
      throw e;
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.wordCategory.delete({ where: { id } });
    } catch (e) {
      if (e.code === 'P2003') {
        throw new BadRequestException(
          'Cannot delete category while words still reference it',
        );
      }
      if (e.code === 'P2025') {
        throw new NotFoundException('Word category not found');
      }
      throw e;
    }
  }
}
