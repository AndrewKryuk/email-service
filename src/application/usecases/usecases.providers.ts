import { Provider } from '@nestjs/common';
import { SendEmailUseCaseAbstract } from '@application/abstract/emails/send-email-usecase.abstract';
import { SendEmailUseCase } from '@application/usecases/emails/send-email.usecase';
import { ValidateAccessTokenUseCaseAbstract } from '@application/abstract/access-token/validate-access-token-usecase.abstract';
import { ValidateAccessTokenUseCase } from '@application/usecases/access-token/validate-access-token.usecase';
import { SendFailedEmailsUseCaseAbstract } from '@application/abstract/emails/send-failed-emails-usecase.abstract';
import { SendFailedEmailsUseCase } from '@application/usecases/emails/send-failed-emails.usecase';
import { RestoreLockedEmailsUseCaseAbstract } from '@application/abstract/emails/restore-locked-emails-usecase.abstract';
import { RestoreLockedEmailsUseCase } from '@application/usecases/emails/restore-locked-emails.usecase';
import { DeleteSentEmailsUseCaseAbstract } from '@application/abstract/emails/delete-sent-emails-usecase.abstract';
import { DeleteSentEmailsUseCase } from '@application/usecases/emails/delete-sent-emails.usecase';

export const emailUseCasesProviders: Provider[] = [
  {
    provide: SendEmailUseCaseAbstract,
    useClass: SendEmailUseCase,
  },
  {
    provide: SendFailedEmailsUseCaseAbstract,
    useClass: SendFailedEmailsUseCase,
  },
  {
    provide: RestoreLockedEmailsUseCaseAbstract,
    useClass: RestoreLockedEmailsUseCase,
  },
  {
    provide: DeleteSentEmailsUseCaseAbstract,
    useClass: DeleteSentEmailsUseCase,
  },
];

export const accessTokenUseCasesProviders: Provider[] = [
  {
    provide: ValidateAccessTokenUseCaseAbstract,
    useClass: ValidateAccessTokenUseCase,
  },
];

export const useCasesProviders: Provider[] = [
  ...emailUseCasesProviders,
  ...accessTokenUseCasesProviders,
];
