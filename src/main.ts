import '@kryuk/ddd-kit/infra/modules/open-telemetry/tracing';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupPinoLogger } from '@kryuk/ddd-kit/infra/modules/pino-logger/setup-pino-logger';
import { setupUnhandledAndUncaughtExceptionHandler } from '@kryuk/ddd-kit/application/utils/setup-unhandled-and-uncaught-exception-handler';
import { HttpConfigAbstract } from '@kryuk/ddd-kit/application/abstract/configuration/http-config.abstract';
import * as bodyParser from 'body-parser';
import { BaseExceptionFilter } from '@kryuk/ddd-kit/transport/filters/base-exception.filter';
import { SerializeInterceptor } from '@kryuk/ddd-kit/transport/interceptors/serialize.interceptor';
import { INestApplication, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { initializeTransactionalContext } from 'typeorm-transactional';

async function bootstrap() {
  initializeTransactionalContext();

  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.use(bodyParser.json({ limit: '20mb' }));
  app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));

  setupPinoLogger(app);

  setupUnhandledAndUncaughtExceptionHandler();

  app.useGlobalFilters(new BaseExceptionFilter());
  app.useGlobalInterceptors(new SerializeInterceptor());
  app.enableCors();
  app.setGlobalPrefix('/api');
  app.enableVersioning({
    type: VersioningType.URI,
  });

  setupOpenApi(app);

  const { port } = app.get(HttpConfigAbstract);

  await app.listen(port);
}

function setupOpenApi(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Email service swagger')
    .setVersion('1.0')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-access-token',
        in: 'header',
        description: 'Enter your access token',
      },
      'x-access-token',
    )
    .addTag('email service');

  const document = SwaggerModule.createDocument(app, config.build());

  SwaggerModule.setup('swagger', app, document, {
    useGlobalPrefix: false,
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}

bootstrap();
