// prisma.config.ts   (must be in project root)
import 'dotenv/config'; // loads .env file
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma', // path to your schema (adjust if nested)
  migrations: {
    path: 'prisma/migrations', // default location
    // seed: 'ts-node prisma/seed.ts',   // optional if you have a seed script
  },
  datasource: {
    url: env('DATABASE_URL'), // reads from .env
  },
});
