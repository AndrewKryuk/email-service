import { Module } from '@nestjs/common';
import { InfraModule } from '@infra/infra.module';
import { ApplicationModule } from '@application/application.module';
import { HealthModule } from '@kryuk/ddd-kit/transport/health/health.module';

@Module({
  imports: [InfraModule, ApplicationModule, HealthModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class TransportModule {}
