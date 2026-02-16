import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateWordCategoryDto } from './dto/create-word-category.dto';
import { UpdateWordCategoryDto } from './dto/update-word-category.dto';
import { WordCategoriesService } from './word-categories.service';

@ApiTags('word-categories')
@Controller('word-categories')
export class WordCategoriesController {
  constructor(
    private readonly wordCategoriesService: WordCategoriesService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiCreatedResponse({ description: 'Word category created successfully' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  create(@Body() createWordCategoryDto: CreateWordCategoryDto) {
    return this.wordCategoriesService.create(createWordCategoryDto);
  }

  @Get()
  @ApiOkResponse({ description: 'Returns all word categories' })
  findAll() {
    return this.wordCategoriesService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Returns one word category by id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.wordCategoriesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ description: 'Word category updated successfully' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWordCategoryDto: UpdateWordCategoryDto,
  ) {
    return this.wordCategoriesService.update(id, updateWordCategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ description: 'Word category deleted successfully' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.wordCategoriesService.remove(id);
  }
}
