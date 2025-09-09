/**
 * is used to restore locked emails
 */
export abstract class RestoreLockedEmailsUseCaseAbstract {
  abstract execute(): Promise<{
    restoredCount: number;
  }>;
}
