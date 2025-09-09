import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { repositoriesProviders } from '@infra/repositories/repositories.providers';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  providers: repositoriesProviders,
  exports: repositoriesProviders,
})
export class RepositoriesModule {}
