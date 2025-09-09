import { Nullable } from '@kryuk/ddd-kit/domain/types/nullable';
import { EEmailStatus } from '@domain/enums/email-status.enum';
import { Undefinedable } from '@kryuk/ddd-kit/domain/types/undefinedable';

export interface IEmailProps {
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
   * Email status
   */
  status: EEmailStatus;

  /**
   * Error
   */
  error?: Nullable<string>;

  /**
   * Next retry date
   */
  nextRetryAt?: Nullable<Date>;

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
