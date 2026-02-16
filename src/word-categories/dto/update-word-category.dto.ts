import { PartialType } from '@nestjs/swagger';
import { CreateWordCategoryDto } from './create-word-category.dto';

export class UpdateWordCategoryDto extends PartialType(CreateWordCategoryDto) {}
