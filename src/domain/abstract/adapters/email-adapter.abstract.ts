import { ISendEmailOptions } from '@domain/interfaces/send-email-options.interface';

export abstract class EmailAdapterAbstract {
  /**
   * is used to send email
   */
  abstract sendEmail(
    sendEmailOptions: ISendEmailOptions,
  ): Promise<{ result: boolean }>;
}
