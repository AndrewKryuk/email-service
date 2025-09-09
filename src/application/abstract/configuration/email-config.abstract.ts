import { EEmailProvider } from '@domain/enums/email-provider.enum';

/**
 * Email configuration
 */
export abstract class EmailConfigAbstract {
  emailProvider: EEmailProvider;
}
