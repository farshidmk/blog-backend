import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; // ← import these

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── CORS ─────────────────────────────────────────────────────────
  app.enableCors({
    origin: [
      'http://localhost:3000', // your Next.js dev
      'http://127.0.0.1:3000',
      // 'https://your-production-domain.com',   // ← add later
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // important if using cookies later
    allowedHeaders: 'Content-Type, Authorization',
    exposedHeaders: ['Authorization'],
    maxAge: 86400, // 24 hours
  });

  // Optional: global validation pipe (very useful with DTOs)
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  // ── Swagger setup ────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('Blog API')
    .setDescription(
      'API for your Next.js blog - authentication, posts, comments, etc.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Paste JWT access token',
      },
      'access-token',
    )
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('words', 'Word management')
    .addTag('word-categories', 'Word category management')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Mount Swagger UI at /api (or /docs, /swagger, whatever you prefer)
  SwaggerModule.setup('api', app, document, {
    // Optional nice defaults
    swaggerOptions: {
      persistAuthorization: true, // keeps token after refresh (good for JWT)
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customCss: '.swagger-ui .topbar { display: none }', // hide top bar if you want clean look
    customSiteTitle: 'Blog API Documentation',
  });
  // ─────────────────────────────────────────────────────────────────

  await app.listen(3000);
  console.log(`Application is running on: http://localhost:3000`);
  console.log(`Swagger UI:              http://localhost:3000/api`);
}

bootstrap();
