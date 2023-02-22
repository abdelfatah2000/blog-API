import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Put,
  Get,
  Param,
  Delete,
} from '@nestjs/common';
import { RefreshTokenGuard } from './guards';
import { AuthService } from './auth.service';
import { SigninDto, SignupDto, UpdateDto } from './dto';
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

  @Put('update')
  @ApiOperation({ summary: 'Update User Data' })
  @HttpCode(HttpStatus.ACCEPTED)
  update(@GetCurrentUser('userId') userId: number, @Body() dto: UpdateDto) {
    return this.authService.update(dto, userId);
  }

  @Get('getUser/:id')
  @ApiOperation({ summary: 'Get User Data' })
  @HttpCode(HttpStatus.OK)
  getUser(@Param('id') userId: number) {
    return this.authService.userData(userId);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete User' })
  @HttpCode(HttpStatus.OK)
  delete(@Param('id') id: number) {
    return this.authService.delete(id);
  }
  @Get('me')
  @ApiOperation({ summary: 'Get My Data' })
  @HttpCode(HttpStatus.OK)
  me(@GetCurrentUser() user: User) {
    return user;
  }
}
