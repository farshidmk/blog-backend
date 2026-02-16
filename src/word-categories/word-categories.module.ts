import { Module } from '@nestjs/common';
import { WordCategoriesController } from './word-categories.controller';
import { WordCategoriesService } from './word-categories.service';

@Module({
  controllers: [WordCategoriesController],
  providers: [WordCategoriesService],
  exports: [WordCategoriesService],
})
export class WordCategoriesModule {}
