import { Injectable } from '@nestjs/common';
import { Log } from '@kryuk/ddd-kit/application/decorators/log.decorator';
import { EmailsOutboxRepositoryAbstract } from '@domain/abstract/repositories/emails-outbox-repository.abstract';
import {
  CHUNK_SIZE,
  MAX_SENT_LIFETIME_MS,
} from '@domain/constants/emails-outbox.constants';
import { EmailsOutbox } from '@domain/entities/emails-outbox';
import { TransactionServiceAbstract } from '@kryuk/ddd-kit/domain/abstract/services/transaction-service.abstract';
import { DeleteSentEmailsUseCaseAbstract } from '@application/abstract/emails/delete-sent-emails-usecase.abstract';
import { Undefinedable } from '@kryuk/ddd-kit/domain/types/undefinedable';

@Injectable()
export class DeleteSentEmailsUseCase
  implements DeleteSentEmailsUseCaseAbstract
{
  constructor(
    private readonly emailsOutboxRepository: EmailsOutboxRepositoryAbstract,
    private readonly transactionService: TransactionServiceAbstract,
  ) {}

  @Log({ level: 'debug' })
  async execute(): Promise<{
    deletedCount: number;
  }> {
    const limit = CHUNK_SIZE;
    let lastCreatedAt: Undefinedable<Date>;
    const beforeUpdatedAt = new Date(Date.now() - MAX_SENT_LIFETIME_MS);

    let deletedCount = 0;
    let emailsOutboxes: EmailsOutbox[] = [];

    do {
      await this.transactionService.withTransaction(async () => {
        emailsOutboxes = await this.emailsOutboxRepository.findExpiredSentChunk(
          beforeUpdatedAt,
          limit,
          lastCreatedAt,
        );

        if (emailsOutboxes.length) {
          lastCreatedAt = emailsOutboxes[emailsOutboxes.length - 1].createdAt;
        }

        const result =
          await this.emailsOutboxRepository.bulkDelete(emailsOutboxes);

        deletedCount += result.deletedCount;
      });
    } while (emailsOutboxes.length === limit);

    return {
      deletedCount,
    };
  }
}
