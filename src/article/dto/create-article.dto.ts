import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreateArticleDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  title: string;

  @IsOptional()
  @IsString()
  describtion?: string;

  @IsNotEmpty()
  @IsString()
  body: string;
}
