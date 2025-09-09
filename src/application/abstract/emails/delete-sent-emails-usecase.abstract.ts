/**
 * is used to delete sent emails
 */
export abstract class DeleteSentEmailsUseCaseAbstract {
  abstract execute(): Promise<{
    deletedCount: number;
  }>;
}
