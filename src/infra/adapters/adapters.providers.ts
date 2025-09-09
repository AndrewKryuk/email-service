import { Provider } from '@nestjs/common';
import { EmailAdapterAbstract } from '@domain/abstract/adapters/email-adapter.abstract';
import { emailAdapterFactory } from '@infra/adapters/factories/email-adapter.factory';
import { EmailConfigAbstract } from '@application/abstract/configuration/email-config.abstract';
import { ModuleRef } from '@nestjs/core';

export const adaptersProviders: Provider[] = [
  {
    provide: EmailAdapterAbstract,
    useFactory: emailAdapterFactory,
    inject: [EmailConfigAbstract, ModuleRef],
  },
];
