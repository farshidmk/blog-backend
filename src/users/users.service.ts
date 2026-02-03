import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // we'll create soon
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(email: string, password: string, username?: string) {
    const hashed = await bcrypt.hash(password, 10);

    try {
      return await this.prisma.user.create({
        data: {
          email,
          username,
          password: hashed,
        },
      });
    } catch (e) {
      if (e.code === 'P2002') {
        throw new ConflictException('Email or username already exists');
      }
      throw e;
    }
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}
