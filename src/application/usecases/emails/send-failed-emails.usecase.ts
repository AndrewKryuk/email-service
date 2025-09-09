import { Injectable } from '@nestjs/common';
import { Log } from '@kryuk/ddd-kit/application/decorators/log.decorator';
import { EmailAdapterAbstract } from '@domain/abstract/adapters/email-adapter.abstract';
import { EmailsOutboxRepositoryAbstract } from '@domain/abstract/repositories/emails-outbox-repository.abstract';
import { validateDTO } from '@kryuk/ddd-kit/application/validation/decorators/validate-dto.decorator';
import {
  CHUNK_SIZE,
  MAX_RETRY_COUNT,
} from '@domain/constants/emails-outbox.constants';
import { EmailsOutbox } from '@domain/entities/emails-outbox';
import { handleActionException } from '@kryuk/ddd-kit/application/utils/handle-action-exception';
import { SendFailedEmailsUseCaseAbstract } from '@application/abstract/emails/send-failed-emails-usecase.abstract';
import { TransactionServiceAbstract } from '@kryuk/ddd-kit/domain/abstract/services/transaction-service.abstract';

@Injectable()
export class SendFailedEmailsUseCase
  implements SendFailedEmailsUseCaseAbstract
{
  constructor(
    private readonly emailAdapter: EmailAdapterAbstract,
    private readonly emailsOutboxRepository: EmailsOutboxRepositoryAbstract,
    private readonly transactionService: TransactionServiceAbstract,
  ) {}

  @Log({ level: 'debug' })
  @validateDTO()
  async execute(): Promise<{ sentCount: number; failedCount: number }> {
    const limit = CHUNK_SIZE;
    const offset = 0;
    const now = new Date();

    let emailsOutboxes: EmailsOutbox[] = [];
    let sentCount = 0;
    let failedCount = 0;

    do {
      await this.transactionService.withTransaction(async () => {
        emailsOutboxes = await this.emailsOutboxRepository.findFailedChunk(
          MAX_RETRY_COUNT,
          now,
          limit,
          offset,
        );

        emailsOutboxes.forEach((emailOutbox) => emailOutbox.markAsProcessing());

        await this.emailsOutboxRepository.bulkSave(emailsOutboxes);
      });

      for (const emailsOutbox of emailsOutboxes) {
        try {
          const { result: isSent } = await this.emailAdapter.sendEmail({
            to: emailsOutbox.to,
            subject: emailsOutbox.subject,
            html: emailsOutbox.html,
          });

          if (isSent) {
            emailsOutbox.markAsSent();
            sentCount++;
          } else {
            emailsOutbox.markAsFailed();
            failedCount++;
          }
        } catch (error: unknown) {
          const { errorMessage } = handleActionException(
            emailsOutbox.id,
            error,
          );
          emailsOutbox.markAsFailed();
          emailsOutbox.setError(errorMessage ?? null);
          failedCount++;
        }

        emailsOutbox.increaseRetry();

        if (emailsOutbox.retryCount >= MAX_RETRY_COUNT) {
          emailsOutbox.markAsMaxRetriesExceeded();
        }
      }

      await this.emailsOutboxRepository.bulkSave(emailsOutboxes);
    } while (emailsOutboxes.length === limit);

    return { sentCount, failedCount };
  }
}
