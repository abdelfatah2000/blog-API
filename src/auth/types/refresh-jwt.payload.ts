import { JwtPayload } from '.';

export type RefreshJwtPayload = {
  refreshToken: string;
} & JwtPayload;
