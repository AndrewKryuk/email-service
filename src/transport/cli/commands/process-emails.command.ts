import { Command, CommandRunner } from 'nest-commander';
import { Logger } from 'nestjs-pino';
import { SendFailedEmailsUseCaseAbstract } from '@application/abstract/emails/send-failed-emails-usecase.abstract';
import { RestoreLockedEmailsUseCaseAbstract } from '@application/abstract/emails/restore-locked-emails-usecase.abstract';
import { DeleteSentEmailsUseCaseAbstract } from '@application/abstract/emails/delete-sent-emails-usecase.abstract';

@Command({
  name: 'process-emails',
  description:
    'Delete expired sent emails, restore locked emails and send failed emails',
})
export class ProcessEmailsCommand extends CommandRunner {
  constructor(
    private readonly deleteSentEmailsUseCase: DeleteSentEmailsUseCaseAbstract,
    private readonly restoreLockedEmailsUseCase: RestoreLockedEmailsUseCaseAbstract,
    private readonly sendFailedEmailsUseCase: SendFailedEmailsUseCaseAbstract,
    private readonly logger: Logger,
  ) {
    super();
  }

  async run(): Promise<void> {
    try {
      await this.deleteSentEmailsUseCase.execute();
      await this.restoreLockedEmailsUseCase.execute();
      await this.sendFailedEmailsUseCase.execute();
    } catch (error: unknown) {
      this.logger.error(error);
    }
  }
}
