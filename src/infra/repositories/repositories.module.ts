import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { repositoriesProviders } from '@infra/repositories/repositories.providers';
import { EmailEntity } from '@infra/entities/email.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EmailEntity])],
  providers: repositoriesProviders,
  exports: repositoriesProviders,
})
export class RepositoriesModule {}
