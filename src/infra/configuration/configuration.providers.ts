import { Provider } from '@nestjs/common';
import {
  httpConfigProvider,
  typeormConfigProvider,
} from '@kryuk/ddd-kit/infra/configuration/configuration.providers';
import { EmailConfigAbstract } from '@application/abstract/configuration/email-config.abstract';
import { emailConfigFactory } from '@infra/configuration/factories/email-config.factory';

export const emailConfigProvider: Provider = {
  provide: EmailConfigAbstract,
  useFactory: emailConfigFactory,
};

export const configurationProviders: Provider[] = [
  httpConfigProvider,
  typeormConfigProvider,
  emailConfigProvider,
];
