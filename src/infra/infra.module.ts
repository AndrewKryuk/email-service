import { Module } from '@nestjs/common';
import { RepositoriesModule } from './repositories/repositories.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configurationProviders } from '@infra/configuration/configuration.providers';
import { ConfigurationModule } from '@kryuk/ddd-kit/infra/configuration/configuration.module';
import { TypeormConfigAbstract } from '@kryuk/ddd-kit/application/abstract/configuration/typeorm-config.abstract';
import { AdaptersModule } from '@infra/adapters/adapters.module';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { DatabaseException } from '@kryuk/ddd-kit/application/exceptions/infra/database-exception';
import { ERROR_CODES } from '@kryuk/ddd-kit/domain/constants/error-codes';
import { transactionServiceProvider } from '@kryuk/ddd-kit/infra/services/services.providers';

@Module({
  imports: [
    ConfigurationModule.forRoot([...configurationProviders]),
    TypeOrmModule.forRootAsync({
      inject: [TypeormConfigAbstract],
      extraProviders: [],
      useFactory: async (typeormConfig: TypeormConfigAbstract) =>
        typeormConfig.options,
      async dataSourceFactory(options) {
        if (!options) {
          throw new DatabaseException([
            { message: 'Invalid options passed', code: ERROR_CODES.DB_ERROR },
          ]);
        }

        const dataSource = new DataSource(options);
        await dataSource.initialize();

        return addTransactionalDataSource(dataSource);
      },
    }),
    RepositoriesModule,
    AdaptersModule,
  ],
  controllers: [],
  providers: [transactionServiceProvider],
  exports: [RepositoriesModule, AdaptersModule, transactionServiceProvider],
})
export class InfraModule {}
