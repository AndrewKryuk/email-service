import { Provider } from '@nestjs/common';
import { EmailRepositoryAbstract } from '@domain/abstract/repositories/email-repository.abstract';
import { EmailRepository } from '@infra/repositories/email.repository';

export const repositoriesProviders: Provider[] = [
  {
    provide: EmailRepositoryAbstract,
    useClass: EmailRepository,
  },
];
