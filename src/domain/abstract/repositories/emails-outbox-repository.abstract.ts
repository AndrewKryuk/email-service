import { BaseRepositoryAbstract } from '@kryuk/ddd-kit/domain/abstract/repositories/base-repository.abstract';
import { EmailsOutbox } from '@domain/entities/emails-outbox';

export abstract class EmailsOutboxRepositoryAbstract extends BaseRepositoryAbstract<EmailsOutbox> {
  abstract findFailedChunk(
    maxRetryCount: number,
    beforeNextRetryAt: Date,
    limit: number,
    lastCreatedAt?: Date,
  ): Promise<EmailsOutbox[]>;

  abstract findLockedChunk(
    beforeLockedAt: Date,
    limit: number,
    lastCreatedAt?: Date,
  ): Promise<EmailsOutbox[]>;

  abstract findExpiredSentChunk(
    beforeUpdatedAt: Date,
    limit: number,
    lastCreatedAt?: Date,
  ): Promise<EmailsOutbox[]>;
}
