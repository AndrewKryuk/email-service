import { Module } from '@nestjs/common';
import { InfraModule } from '@infra/infra.module';
import { ApplicationModule } from '@application/application.module';
import { TransportModule } from '@transport/transport.module';
import { PinoLoggerModule } from '@kryuk/ddd-kit/infra/modules/pino-logger/pino-logger.module';

@Module({
  imports: [PinoLoggerModule, InfraModule, ApplicationModule, TransportModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
