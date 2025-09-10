import { Module } from '@nestjs/common';
import { servicesProviders } from '@infra/services/services.providers';

@Module({
  imports: [],
  providers: servicesProviders,
  exports: servicesProviders,
})
export class ServicesModule {}
