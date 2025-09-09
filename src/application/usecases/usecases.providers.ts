import { Provider } from '@nestjs/common';
import { SendEmailUseCaseAbstract } from '@application/abstract/emails/send-email-usecase.abstract';
import { SendEmailUseCase } from '@application/usecases/emails/send-email.usecase';
import { ValidateAccessTokenUseCaseAbstract } from '@application/abstract/access-token/validate-access-token-usecase.abstract';
import { ValidateAccessTokenUseCase } from '@application/usecases/access-token/validate-access-token.usecase';

export const emailUseCasesProviders: Provider[] = [
  {
    provide: SendEmailUseCaseAbstract,
    useClass: SendEmailUseCase,
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
