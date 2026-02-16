import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Request } from 'express';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'identifier',
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    identifier: string,
    password: string,
  ): Promise<any> {
    const normalizedIdentifier = String(identifier || req.body?.email || '');
    const user = await this.authService.validateUser(
      normalizedIdentifier,
      password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }
}
