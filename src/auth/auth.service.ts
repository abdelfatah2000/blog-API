import {
  Injectable,
  HttpException,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto, SigninDto } from './dto';
import * as argon from 'argon2';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, Token } from './types';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: SignupDto): Promise<User> {
    const hash = await this.hashData(dto.password);
    dto.password = hash;
    try {
      const user = await this.prisma.user.create({
        data: dto,
      });
      delete user['password'];
      return user;
    } catch (error) {
      throw new HttpException(
        `Invalid ${error.meta.target[0]}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async signin(dto: SigninDto): Promise<Token> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });
      if (!user)
        throw new HttpException('Wrong Credentials', HttpStatus.BAD_GATEWAY);
      await this.verifyData(user.password, dto.password);
      const tokens = await this.generateToken(dto.email, user.id);
      await this.updateHashedRefreshToken(user.id, tokens.refresh_token);
      return tokens;
    } catch (error) {
      throw new HttpException('Error', HttpStatus.BAD_GATEWAY);
    }
  }

  async refreshToken(userId: number, refreshToken: string): Promise<Token> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user || !user.refreshToken)
      throw new ForbiddenException('Access Denied');
    await this.verifyData(user.refreshToken, refreshToken);
    const tokens = await this.generateToken(user.email, user.id);
    await this.updateHashedRefreshToken(user.id, tokens.refresh_token);
    return tokens;
  }

  async logout(userId: number): Promise<string> {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
      },
      data: {
        refreshToken: null,
      },
    });
    return 'User is logged out';
  }

  private async generateToken(email: string, userId: number): Promise<Token> {
    const payload: JwtPayload = {
      sub: userId,
      email: email,
    };
    const access = await this.jwt.signAsync(payload, {
      secret: this.config.get('ACCESS_TOKEN_SECRET'),
      expiresIn: '1h',
    });
    const refresh = await this.jwt.signAsync(payload, {
      secret: this.config.get('REFRESH_TOKEN_SECRET'),
      expiresIn: '7d',
    });
    return {
      access_token: access,
      refresh_token: refresh,
    };
  }

  private async updateHashedRefreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<void> {
    const hash = await this.hashData(refreshToken);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: hash,
      },
    });
  }

  private hashData(data: string): Promise<string> {
    return argon.hash(data);
  }

  private async verifyData(hashPassword: string, plainPassword: string) {
    const isMatching = await argon.verify(hashPassword, plainPassword);
    if (!isMatching)
      throw new HttpException('Wrong Credentials', HttpStatus.BAD_REQUEST);
  }
}
