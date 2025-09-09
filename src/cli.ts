import { CommandFactory } from 'nest-commander';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await CommandFactory.createWithoutRunning(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));
  await CommandFactory.runApplication(app);
  await app.close();
}

bootstrap();
