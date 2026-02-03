import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // ← THIS IS THE KEY
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // must export so others can inject it
})
export class PrismaModule {}
