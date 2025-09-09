import { cleanEnv, str } from 'envalid';
import { EmailConfigAbstract } from '@application/abstract/configuration/email-config.abstract';
import { EEmailProvider } from '@domain/enums/email-provider.enum';

export const emailConfigFactory: () => EmailConfigAbstract = () => {
  const env = cleanEnv(process.env, {
    EMAIL_PROVIDER: str<EEmailProvider>({ default: EEmailProvider.smtp }),
  });

  return {
    emailProvider: env.EMAIL_PROVIDER,
  };
};
