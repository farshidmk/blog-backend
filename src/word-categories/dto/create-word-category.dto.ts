import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateWordCategoryDto {
  @ApiProperty({
    description: 'Unique category name',
    example: 'Animals',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
