import { Provider } from '@nestjs/common';
import {
  httpConfigProvider,
  typeormConfigProvider,
} from '@kryuk/ddd-kit/infra/configuration/configuration.providers';
import { EmailConfigAbstract } from '@application/abstract/configuration/email-config.abstract';
import { emailConfigFactory } from '@infra/configuration/factories/email-config.factory';
import { AccessTokenConfigAbstract } from '@application/abstract/configuration/access-token-config.abstract';
import { accessTokenConfigFactory } from '@infra/configuration/factories/access-token-config.factory';

export const emailConfigProvider: Provider = {
  provide: EmailConfigAbstract,
  useFactory: emailConfigFactory,
};

export const accessTokenConfigProvider: Provider = {
  provide: AccessTokenConfigAbstract,
  useFactory: accessTokenConfigFactory,
};

export const configurationProviders: Provider[] = [
  httpConfigProvider,
  typeormConfigProvider,
  emailConfigProvider,
  accessTokenConfigProvider,
];
