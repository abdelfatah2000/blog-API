import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Token } from './types';
import { AccessTokenGuard, RefreshTokenGuard } from './guards';
import { AuthService } from './auth.service';
import { SigninDto, SignupDto } from './dto';
import { GetCurrentUser, Public } from '../common/decorators';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private config: ConfigService,
  ) {}
  @Public()
  @ApiOperation({ summary: 'User Register' })
  @Post('signup')
  @HttpCode(HttpStatus.ACCEPTED)
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Public()
  @Post('signin')
  @ApiOperation({ summary: 'User Login' })
  @HttpCode(HttpStatus.OK)
  signin(@Body() dto: SigninDto) {
    return this.authService.signin(dto);
  }

  @Post('logout')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'User Logout' })
  @HttpCode(HttpStatus.OK)
  logout(@GetCurrentUser('userId') userId: number) {
    return this.authService.logout(userId);
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @ApiOperation({ summary: 'Get New Access Token' })
  @HttpCode(HttpStatus.OK)
  refresh(@GetCurrentUser() user) {
    return this.authService.refreshToken(user.sub, user.refreshToken);
  }
}
