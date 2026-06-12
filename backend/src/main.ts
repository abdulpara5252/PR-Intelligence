import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { json } from 'express';
import { AppModule } from './app.module';
import type { Configuration } from './config/configuration';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  app.use(
    json({
      verify: (request, _response, buffer) => {
        (request as typeof request & { rawBody?: Buffer }).rawBody = buffer;
      },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors();

  const configService = app.get(ConfigService<Configuration, true>);
  const port = configService.get('app.port', { infer: true });

  await app.listen(port);
}

void bootstrap();
