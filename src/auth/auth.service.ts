import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    return this.usersService.validateUser(email, pass);
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
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  async register(data: { email: string; password: string; username?: string }) {
    const user = await this.usersService.create(
      data.email,
      data.password,
      data.username,
    );
    return this.login(user); // auto-login after register
  }
}
