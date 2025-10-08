import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet, { type FastifyHelmetOptions } from '@fastify/helmet';
import cors, { type FastifyCorsOptions, type FastifyCorsOptionsDelegate } from '@fastify/cors';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false })
  );

  const helmetOptions: FastifyHelmetOptions = { contentSecurityPolicy: false };
  await app.register(helmet as unknown as Parameters<typeof app.register>[0], helmetOptions);

  const corsOptions: FastifyCorsOptions = {
    origin: true,
    credentials: true
  } satisfies FastifyCorsOptions;
  await app.register(cors as unknown as Parameters<typeof app.register>[0], corsOptions as FastifyCorsOptions | FastifyCorsOptionsDelegate);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port') ?? 4000;

  app.enableShutdownHooks();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Hatch CRM API')
    .setDescription('API surface for Hatch CRM MVP')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen({ port, host: configService.get<string>('app.host') ?? '0.0.0.0' });
}

void bootstrap();
