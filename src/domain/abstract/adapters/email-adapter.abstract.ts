import { ISendEmailOptions } from '@domain/interfaces/send-email-options.interface';

export abstract class EmailAdapterAbstract {
  /**
   * is used to send email
   */
  abstract sendEmail(options: ISendEmailOptions): Promise<{ result: boolean }>;
}
