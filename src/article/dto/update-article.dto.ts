import { IsString, IsOptional, MinLength } from 'class-validator';

export class EditArticleDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @IsOptional()
  @IsString()
  describtion?: string;

  @IsOptional()
  @IsString()
  body?: string;
}
