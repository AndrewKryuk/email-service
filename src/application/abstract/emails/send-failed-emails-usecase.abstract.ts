/**
 * is used to send failed emails
 */
export abstract class SendFailedEmailsUseCaseAbstract {
  abstract execute(): Promise<{ sentCount: number; failedCount: number }>;
}
