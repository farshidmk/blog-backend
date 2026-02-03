import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaModule } from '../prisma/prisma.module'; // assuming you have this from earlier fix

@Module({
  imports: [PrismaModule], // if UsersService needs Prisma
  providers: [UsersService],
  exports: [UsersService], // ← THIS IS REQUIRED
})
export class UsersModule {}
