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
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Prisma, Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { QueryFilter } from '../common/decorators/queryFilter.decorator';
import { CreateWordDto } from './dto/create-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';
import { WordsService } from './words.service';

@ApiTags('words')
@Controller('words')
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiCreatedResponse({ description: 'Word created successfully' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  create(@Body() createWordDto: CreateWordDto) {
    return this.wordsService.create(createWordDto);
  }

  @Get()
  @ApiQuery({
    name: 'filter',
    required: false,
    type: String,
    description:
      'LoopBack-style JSON string. Example: {"where":{"difficulty":"easy"},"order":{"id":"DESC"},"skip":0,"take":10}',
  })
  @ApiOkResponse({ description: 'Returns words with filtering/sorting/pagination' })
  findAll(@QueryFilter('Word') filter: Prisma.WordFindManyArgs) {
    return this.wordsService.findAll(filter);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Returns one word by id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.wordsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ description: 'Word updated successfully' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWordDto: UpdateWordDto,
  ) {
    return this.wordsService.update(id, updateWordDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ description: 'Word deleted successfully' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.wordsService.remove(id);
  }
}
