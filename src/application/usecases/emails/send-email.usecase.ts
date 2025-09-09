import { Injectable } from '@nestjs/common';
import { SendEmailUseCaseAbstract } from '@application/abstract/emails/send-email-usecase.abstract';
import { Log } from '@kryuk/ddd-kit/application/decorators/log.decorator';
import { validateDTO } from '@kryuk/ddd-kit/application/validation/decorators/validate-dto.decorator';
import { DTO } from '@kryuk/ddd-kit/application/validation/decorators/dto.decorator';
import { SendEmailDTO } from '@application/dto/emails/send-email.dto';
import { ActionResult } from '@kryuk/ddd-kit/domain/interfaces/action-result.interface';
import { EmailAdapterAbstract } from '@domain/abstract/adapters/email-adapter.abstract';
import { handleActionException } from '@kryuk/ddd-kit/application/utils/handle-action-exception';
import { EmailRepositoryAbstract } from '@domain/abstract/repositories/email-repository.abstract';
import { Email } from '@domain/entities/email';
import { EEmailStatus } from '@domain/enums/email-status.enum';
import {
  ERROR_CODE,
  SUCCEED_CODE,
} from '@kryuk/ddd-kit/domain/constants/error-codes';
import { Undefinedable } from '@kryuk/ddd-kit/domain/types/undefinedable';

@Injectable()
export class SendEmailUseCase implements SendEmailUseCaseAbstract {
  constructor(
    private readonly emailAdapter: EmailAdapterAbstract,
    private readonly emailRepository: EmailRepositoryAbstract,
  ) {}

  @Log({ level: 'debug' })
  @validateDTO()
  async execute(@DTO() sendEmailDTO: SendEmailDTO): Promise<ActionResult> {
    let email: Undefinedable<Email>;

    try {
      const { result: isSent } =
        await this.emailAdapter.sendEmail(sendEmailDTO);

      email = Email.create({
        to: sendEmailDTO.to,
        subject: sendEmailDTO.subject,
        html: sendEmailDTO.html,
        status: isSent ? EEmailStatus.sent : EEmailStatus.failed,
        retryCount: 0,
      });
    } catch (error: unknown) {
      email = Email.create({
        to: sendEmailDTO.to,
        subject: sendEmailDTO.subject,
        html: sendEmailDTO.html,
        status: EEmailStatus.failed,
        retryCount: 0,
      });

      const { errorMessage } = handleActionException(email.id, error);
      email.setError(errorMessage ?? null);
    }

    await this.emailRepository.save(email);

    return {
      id: email.id,
      status: email.status === EEmailStatus.sent ? SUCCEED_CODE : ERROR_CODE,
      ...(email.error ? { errorMessage: email.error } : {}),
    };
  }
}
