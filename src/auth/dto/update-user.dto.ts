import { IsEmail, IsString, IsNumber, IsOptional } from 'class-validator';
export class UpdateDto {
  @IsString()
  @IsOptional()
  readonly name?: string;

  @IsNumber()
  @IsOptional()
  readonly phone?: number;

  @IsEmail()
  @IsOptional()
  readonly email?: string;
}
