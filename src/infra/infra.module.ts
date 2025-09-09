import { Module } from '@nestjs/common';
import { RepositoriesModule } from './repositories/repositories.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configurationProviders } from '@infra/configuration/configuration.providers';
import { ConfigurationModule } from '@kryuk/ddd-kit/infra/configuration/configuration.module';
import { TypeormConfigAbstract } from '@kryuk/ddd-kit/application/abstract/configuration/typeorm-config.abstract';
import { AdaptersModule } from '@infra/adapters/adapters.module';
import { transactionServiceProvider } from '@kryuk/ddd-kit/infra/services/services.providers';

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
  providers: [transactionServiceProvider],
  exports: [RepositoriesModule, AdaptersModule, transactionServiceProvider],
})
export class InfraModule {}
