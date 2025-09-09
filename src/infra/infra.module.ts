import { Module } from '@nestjs/common';
import { RepositoriesModule } from './repositories/repositories.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configurationProviders } from '@infra/configuration/configuration.providers';
import { ConfigurationModule } from '@kryuk/ddd-kit/infra/configuration/configuration.module';
import { TypeormConfigAbstract } from '@kryuk/ddd-kit/application/abstract/configuration/typeorm-config.abstract';
import { AdaptersModule } from '@infra/adapters/adapters.module';

@Module({
  imports: [
    ConfigurationModule.forRoot([...configurationProviders]),
    TypeOrmModule.forRootAsync({
      inject: [TypeormConfigAbstract],
      useFactory: async (typeormConfig: TypeormConfigAbstract) =>
        typeormConfig.options,
    }),
    RepositoriesModule,
    AdaptersModule,
  ],
  controllers: [],
  providers: [],
  exports: [RepositoriesModule, AdaptersModule],
})
export class InfraModule {}
