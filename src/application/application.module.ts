import { Module } from '@nestjs/common';
import { useCasesProviders } from '@application/usecases/usecases.providers';
import { InfraModule } from '@infra/infra.module';

@Module({
  imports: [InfraModule],
  controllers: [],
  providers: useCasesProviders,
  exports: useCasesProviders,
})
export class ApplicationModule {}
