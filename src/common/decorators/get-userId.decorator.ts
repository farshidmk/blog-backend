import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export const GetUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): number => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as { userId?: number } | undefined;

    if (!user?.userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    return user.userId;
  },
);
