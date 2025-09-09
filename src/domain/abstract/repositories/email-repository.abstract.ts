import { BaseRepositoryAbstract } from '@kryuk/ddd-kit/domain/abstract/repositories/base-repository.abstract';
import { Email } from '@domain/entities/email';

export abstract class EmailRepositoryAbstract extends BaseRepositoryAbstract<Email> {}
