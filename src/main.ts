import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { EnvironmentConfigService } from './infrastructure/config/environment-config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.enableCors();

  const configService = app.get(EnvironmentConfigService);
  const port = configService.getPort();

  await app.listen(port);

  logger.log(`Aplicación iniciada en http://localhost:${port}`);
}

bootstrap();
