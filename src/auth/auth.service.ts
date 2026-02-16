import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(identifier: string, pass: string): Promise<any> {
    return this.usersService.validateUser(identifier, pass);
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      // refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }), // optional
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        phone: user.phone,
        role: user.role,
      },
    };
  }

  async register(data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    phone?: string;
  }) {
    const user = await this.usersService.create(
      data.email,
      data.password,
      data.firstName,
      data.lastName,
      data.username,
      data.phone,
    );
    return this.login(user); // auto-login after register
  }
}
