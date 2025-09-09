import { Injectable } from '@nestjs/common';
import { Log } from '@kryuk/ddd-kit/application/decorators/log.decorator';
import { EmailsOutboxRepositoryAbstract } from '@domain/abstract/repositories/emails-outbox-repository.abstract';
import { validateDTO } from '@kryuk/ddd-kit/application/validation/decorators/validate-dto.decorator';
import {
  CHUNK_SIZE,
  MAX_SENT_LIFETIME_MS,
} from '@domain/constants/emails-outbox.constants';
import { EmailsOutbox } from '@domain/entities/emails-outbox';
import { TransactionServiceAbstract } from '@kryuk/ddd-kit/domain/abstract/services/transaction-service.abstract';
import { DeleteSentEmailsUseCaseAbstract } from '@application/abstract/emails/delete-sent-emails-usecase.abstract';

@Injectable()
export class DeleteSentEmailsUseCase
  implements DeleteSentEmailsUseCaseAbstract
{
  constructor(
    private readonly emailsOutboxRepository: EmailsOutboxRepositoryAbstract,
    private readonly transactionService: TransactionServiceAbstract,
  ) {}

  @Log({ level: 'debug' })
  @validateDTO()
  async execute(): Promise<{
    deletedCount: number;
  }> {
    const limit = CHUNK_SIZE;
    const offset = 0;
    const beforeUpdatedAt = new Date(Date.now() - MAX_SENT_LIFETIME_MS);

    let deletedCount = 0;
    let emailsOutboxes: EmailsOutbox[] = [];

    do {
      await this.transactionService.withTransaction(async () => {
        emailsOutboxes = await this.emailsOutboxRepository.findExpiredSentChunk(
          beforeUpdatedAt,
          limit,
          offset,
        );

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
