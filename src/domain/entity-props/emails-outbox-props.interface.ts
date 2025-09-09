import { Nullable } from '@kryuk/ddd-kit/domain/types/nullable';
import { Undefinedable } from '@kryuk/ddd-kit/domain/types/undefinedable';
import { EEmailOutboxStatus } from '@domain/enums/email-outbox-status.enum';

export interface IEmailOutboxProps {
  /**
   * UUID
   */
  id: string;

  /**
   * Email addresses
   */
  to: string[];

  /**
   * Email subject
   */
  subject: string;

  /**
   * Html email content
   */
  html: string;

  /**
   * Retry count
   */
  retryCount: number;

  /**
   * Email outbox status
   */
  status: EEmailOutboxStatus;

  /**
   * Error
   */
  error?: Nullable<string>;

  /**
   * Next retry date
   */
  nextRetryAt?: Nullable<Date>;

  /**
   * Locked at
   */
  lockedAt?: Nullable<Date>;

  /**
   * Creation date,
   */
  createdAt?: Date;

  /**
   * Update date,
   */
  updatedAt?: Date;

  /**
   * Delete date,
   */
  deletedAt?: Undefinedable<Nullable<Date>>;
}
