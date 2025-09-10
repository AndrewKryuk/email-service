import { DomainEntity } from '@kryuk/ddd-kit/domain/base/domain-entity';
import { DefaultOptionalCreateProps } from '@kryuk/ddd-kit/domain/types/default-optional-create-props';
import { Nullable } from '@kryuk/ddd-kit/domain/types/nullable';
import { Undefinedable } from '@kryuk/ddd-kit/domain/types/undefinedable';
import { NEXT_RETRY_DURATION_MS } from '@domain/constants/emails-outbox.constants';
import { IEmailOutboxProps } from '@domain/entity-props/emails-outbox-props.interface';
import { EEmailOutboxStatus } from '@domain/enums/email-outbox-status.enum';

export class EmailsOutbox extends DomainEntity<IEmailOutboxProps> {
  private constructor({
    id,
    ...data
  }: DefaultOptionalCreateProps<IEmailOutboxProps>) {
    super(data as IEmailOutboxProps, id);
  }

  static create(
    emailsOutboxProps: DefaultOptionalCreateProps<IEmailOutboxProps>,
  ): EmailsOutbox {
    return new EmailsOutbox(emailsOutboxProps);
  }

  unmarshal(): IEmailOutboxProps {
    const {
      id,
      to,
      subject,
      html,
      retryCount,
      nextRetryAt,
      status,
      error,
      lockedAt,
      createdAt,
      updatedAt,
      deletedAt,
    } = this;

    return {
      id,
      to,
      subject,
      html,
      retryCount,
      nextRetryAt,
      status,
      error,
      lockedAt,
      createdAt,
      updatedAt,
      deletedAt,
    };
  }

  setError(error: Nullable<string> = null): void {
    this.props.error = error;
  }

  markAsFailed(): void {
    this.props.status = EEmailOutboxStatus.failed;
    this.props.lockedAt = null;
    this.props.nextRetryAt = new Date(Date.now() + NEXT_RETRY_DURATION_MS);
  }

  markAsSent(): void {
    this.props.status = EEmailOutboxStatus.sent;
    this.props.lockedAt = null;
    this.props.nextRetryAt = null;
  }

  markAsProcessing(): void {
    this.props.status = EEmailOutboxStatus.processing;
    this.props.lockedAt = new Date();
  }

  markAsMaxRetriesExceeded(): void {
    this.props.status = EEmailOutboxStatus.maxRetriesExceeded;
    this.props.lockedAt = null;
  }

  increaseRetry(): void {
    this.props.retryCount++;
    this.props.nextRetryAt = new Date(Date.now() + NEXT_RETRY_DURATION_MS);
  }

  get id(): string {
    return this._id;
  }

  get to(): string[] {
    return this.props.to;
  }

  get subject(): string {
    return this.props.subject;
  }

  get html(): string {
    return this.props.html;
  }

  get retryCount(): number {
    return this.props.retryCount;
  }

  get status(): EEmailOutboxStatus {
    return this.props.status;
  }

  get nextRetryAt(): Undefinedable<Nullable<Date>> {
    return this.props.nextRetryAt;
  }

  get lockedAt(): Undefinedable<Nullable<Date>> {
    return this.props.lockedAt;
  }

  get error(): Undefinedable<Nullable<string>> {
    return this.props.error;
  }

  get createdAt(): Date {
    return this.props.createdAt || new Date();
  }

  get updatedAt(): Date {
    return this.props.updatedAt || new Date();
  }

  get deletedAt(): Undefinedable<Nullable<Date>> {
    return this.props.deletedAt;
  }
}
