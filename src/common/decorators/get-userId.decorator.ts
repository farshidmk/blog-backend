import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { decode } from 'jsonwebtoken';

export const GetUserId = createParamDecorator(
  (data, ctx: ExecutionContext): number => {
    const request = ctx.switchToHttp().getRequest();

    const decodedToken = decode(request.cookies?.token) as User | null;
    if (!decodedToken) {
      throw new UnauthorizedException('کاربر پیدا نشده است');
    }
    return decodedToken.id;
  },
);
