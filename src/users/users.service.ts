import {
  Injectable,
  ConflictException,
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

  async create(
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
    username?: string,
    phone?: string,
  ) {
    const hashed = await bcrypt.hash(password, 10);

    try {
      return await this.prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          username,
          phone,
          password: hashed,
        },
      });
    } catch (e) {
      if (e.code === 'P2002') {
        throw new ConflictException('Email, username or phone already exists');
      }
      throw e;
    }
  }

  async validateUser(identifier: string, pass: string): Promise<any> {
    const normalized = identifier?.trim();
    if (!normalized) {
      return null;
    }

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: normalized, mode: 'insensitive' } },
          { username: { equals: normalized, mode: 'insensitive' } },
          { phone: normalized },
        ],
      },
    });

    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}
