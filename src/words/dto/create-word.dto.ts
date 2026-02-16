import { Difficulty } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateWordDto {
  @ApiProperty({
    description: 'The word text',
    example: 'Elephant',
  })
  @IsString()
  @IsNotEmpty()
  word: string;

  @ApiProperty({
    description: 'Word difficulty',
    enum: Difficulty,
    example: Difficulty.medium,
  })
  @IsEnum(Difficulty)
  difficulty: Difficulty;

  @ApiProperty({
    description: 'Existing word category id',
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  wordCategoryId: number;
}
