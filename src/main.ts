import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004', 'http://localhost:3005'], // Allow all common Next.js dev ports
    methods: 'GET, POST, PUT, DELETE, PATCH', // Разрешаем необходимые методы
    allowedHeaders: 'Content-Type, Accept, Authorization, Cookie', // Разрешаем заголовки
    credentials: true, // Разрешаем передавать куки
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
