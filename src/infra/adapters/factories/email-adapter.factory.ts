import { EmailConfigAbstract } from '@application/abstract/configuration/email-config.abstract';
import { EEmailProvider } from '@domain/enums/email-provider.enum';
import { MailgunAdapter } from '@infra/adapters/mailgun.adapter';
import { SendgridAdapter } from '@infra/adapters/sendgrid.adapter';
import { SmtpAdapter } from '@infra/adapters/smtp.adapter';
import { ModuleRef } from '@nestjs/core';

export const emailAdapterFactory = (
  { emailProvider }: EmailConfigAbstract,
  moduleRef: ModuleRef,
) => {
  switch (emailProvider) {
    case EEmailProvider.mailgun:
      return moduleRef.create(MailgunAdapter);

    case EEmailProvider.sendgrid:
      return moduleRef.create(SendgridAdapter);

    case EEmailProvider.smtp:
    default:
      return moduleRef.create(SmtpAdapter);
  }
};
