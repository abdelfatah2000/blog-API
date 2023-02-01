import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, AccessTokenContent } from '../types';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  'access-jwt',
) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('ACCESS_TOKEN_SECRET'),
    });
  }
  async validate(payload: JwtPayload): Promise<AccessTokenContent> {
    return {
      userId: payload.sub,
      email: payload.email,
    };
  }
}
