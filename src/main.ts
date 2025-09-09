import '@kryuk/ddd-kit/infra/modules/open-telemetry/tracing';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupPinoLogger } from '@kryuk/ddd-kit/infra/modules/pino-logger/setup-pino-logger';
import { setupUnhandledAndUncaughtExceptionHandler } from '@kryuk/ddd-kit/application/utils/setup-unhandled-and-uncaught-exception-handler';
import { HttpConfigAbstract } from '@kryuk/ddd-kit/application/abstract/configuration/http-config.abstract';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  setupPinoLogger(app);

  setupUnhandledAndUncaughtExceptionHandler();

  const { port } = app.get(HttpConfigAbstract);

  await app.listen(port);
}

bootstrap();
