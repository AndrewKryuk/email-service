import { Injectable } from '@nestjs/common';
import { Log } from '@kryuk/ddd-kit/application/decorators/log.decorator';
import { EmailsOutboxRepositoryAbstract } from '@domain/abstract/repositories/emails-outbox-repository.abstract';
import { validateDTO } from '@kryuk/ddd-kit/application/validation/decorators/validate-dto.decorator';
import {
  CHUNK_SIZE,
  MAX_LOCKED_TIME_MS,
} from '@domain/constants/emails-outbox.constants';
import { EmailsOutbox } from '@domain/entities/emails-outbox';
import { TransactionServiceAbstract } from '@kryuk/ddd-kit/domain/abstract/services/transaction-service.abstract';
import { RestoreLockedEmailsUseCaseAbstract } from '@application/abstract/emails/restore-locked-emails-usecase.abstract';
import { Undefinedable } from '@kryuk/ddd-kit/domain/types/undefinedable';

@Injectable()
export class RestoreLockedEmailsUseCase
  implements RestoreLockedEmailsUseCaseAbstract
{
  constructor(
    private readonly emailsOutboxRepository: EmailsOutboxRepositoryAbstract,
    private readonly transactionService: TransactionServiceAbstract,
  ) {}

  @Log({ level: 'debug' })
  @validateDTO()
  async execute(): Promise<{
    restoredCount: number;
  }> {
    const limit = CHUNK_SIZE;
    let lastCreatedAt: Undefinedable<Date>;
    const beforeLockedAt = new Date(Date.now() - MAX_LOCKED_TIME_MS);

    let restoredCount = 0;
    let emailsOutboxes: EmailsOutbox[] = [];

    do {
      await this.transactionService.withTransaction(async () => {
        emailsOutboxes = await this.emailsOutboxRepository.findLockedChunk(
          beforeLockedAt,
          limit,
          lastCreatedAt,
        );

        emailsOutboxes.forEach((emailOutbox) => emailOutbox.markAsFailed());

        await this.emailsOutboxRepository.bulkSave(emailsOutboxes);

        restoredCount += emailsOutboxes.length;
        if (emailsOutboxes.length) {
          lastCreatedAt = emailsOutboxes[emailsOutboxes.length - 1].createdAt;
        }
      });
    } while (emailsOutboxes.length === limit);

    return {
      restoredCount,
    };
  }
}
