import { Module } from '@nestjs/common';
import { InfraModule } from '@infra/infra.module';
import { ApplicationModule } from '@application/application.module';
import { HealthModule } from '@kryuk/ddd-kit/transport/health/health.module';
import { EmailsController } from '@transport/http/controllers/emails.controller';

@Module({
  imports: [InfraModule, ApplicationModule, HealthModule],
  controllers: [EmailsController],
  providers: [],
  exports: [],
})
export class TransportModule {}
