import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsInt,
  MinLength,
  IsOptional,
} from 'class-validator';

export class SignupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsInt()
  @IsOptional()
  phone?: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  password: string;
}
