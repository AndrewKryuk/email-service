import { Module } from '@nestjs/common';
import { adaptersProviders } from '@infra/adapters/adapters.providers';

@Module({
  imports: [],
  providers: adaptersProviders,
  exports: adaptersProviders,
})
export class AdaptersModule {}
