import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreateDto {
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
