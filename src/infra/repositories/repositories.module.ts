import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { repositoriesProviders } from '@infra/repositories/repositories.providers';
import { EmailsOutboxEntity } from '@infra/entities/emails-outbox.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EmailsOutboxEntity])],
  providers: repositoriesProviders,
  exports: repositoriesProviders,
})
export class RepositoriesModule {}
