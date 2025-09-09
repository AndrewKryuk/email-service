import { Injectable } from '@nestjs/common';
import { SendEmailUseCaseAbstract } from '@application/abstract/emails/send-email-usecase.abstract';
import { Log } from '@kryuk/ddd-kit/application/decorators/log.decorator';
import { DTO } from '@kryuk/ddd-kit/application/validation/decorators/dto.decorator';
import { SendEmailDTO } from '@application/dto/emails/send-email.dto';
import { ActionResult } from '@kryuk/ddd-kit/domain/interfaces/action-result.interface';
import { EmailAdapterAbstract } from '@domain/abstract/adapters/email-adapter.abstract';
import { handleActionException } from '@kryuk/ddd-kit/application/utils/handle-action-exception';
import { EmailsOutboxRepositoryAbstract } from '@domain/abstract/repositories/emails-outbox-repository.abstract';
import { EmailsOutbox } from '@domain/entities/emails-outbox';
import {
  ERROR_CODE,
  SUCCEED_CODE,
} from '@kryuk/ddd-kit/domain/constants/error-codes';
import { Undefinedable } from '@kryuk/ddd-kit/domain/types/undefinedable';
import { validateDTO } from '@kryuk/ddd-kit/application/validation/decorators/validate-dto.decorator';
import { NEXT_RETRY_DURATION_MS } from '@domain/constants/emails-outbox.constants';
import { EEmailOutboxStatus } from '@domain/enums/email-outbox-status.enum';

@Injectable()
export class SendEmailUseCase implements SendEmailUseCaseAbstract {
  constructor(
    private readonly emailAdapter: EmailAdapterAbstract,
    private readonly emailsOutboxRepository: EmailsOutboxRepositoryAbstract,
  ) {}

  @Log({ level: 'debug' })
  @validateDTO()
  async execute(@DTO() sendEmailDTO: SendEmailDTO): Promise<ActionResult> {
    let emailsOutbox: Undefinedable<EmailsOutbox>;

    try {
      const { result: isSent } =
        await this.emailAdapter.sendEmail(sendEmailDTO);

      emailsOutbox = EmailsOutbox.create({
        to: sendEmailDTO.to,
        subject: sendEmailDTO.subject,
        html: sendEmailDTO.html,
        status: isSent ? EEmailOutboxStatus.sent : EEmailOutboxStatus.failed,
        retryCount: 0,
        ...(!isSent
          ? { nextRetryAt: new Date(Date.now() + NEXT_RETRY_DURATION_MS) }
          : {}),
      });
    } catch (error: unknown) {
      emailsOutbox = EmailsOutbox.create({
        to: sendEmailDTO.to,
        subject: sendEmailDTO.subject,
        html: sendEmailDTO.html,
        status: EEmailOutboxStatus.failed,
        retryCount: 0,
        nextRetryAt: new Date(Date.now() + NEXT_RETRY_DURATION_MS),
      });

      const { errorMessage } = handleActionException(emailsOutbox.id, error);
      emailsOutbox.setError(errorMessage ?? null);
    }

    await this.emailsOutboxRepository.save(emailsOutbox);

    return {
      id: emailsOutbox.id,
      status:
        emailsOutbox.status === EEmailOutboxStatus.sent
          ? SUCCEED_CODE
          : ERROR_CODE,
      ...(emailsOutbox.error ? { errorMessage: emailsOutbox.error } : {}),
    };
  }
}
