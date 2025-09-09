import { Provider } from '@nestjs/common';
import { EmailsOutboxRepositoryAbstract } from '@domain/abstract/repositories/emails-outbox-repository.abstract';
import { EmailsOutboxRepository } from '@infra/repositories/emails-outbox.repository';

export const repositoriesProviders: Provider[] = [
  {
    provide: EmailsOutboxRepositoryAbstract,
    useClass: EmailsOutboxRepository,
  },
];
