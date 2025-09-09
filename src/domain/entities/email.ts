import { IEmailProps } from '@domain/entity-props/email-props.interface';
import { DomainEntity } from '@kryuk/ddd-kit/domain/base/domain-entity';
import { DefaultOptionalCreateProps } from '@kryuk/ddd-kit/domain/types/default-optional-create-props';
import { EEmailStatus } from '@domain/enums/email-status.enum';
import { Nullable } from '@kryuk/ddd-kit/domain/types/nullable';
import { Undefinedable } from '@kryuk/ddd-kit/domain/types/undefinedable';

export class Email extends DomainEntity<IEmailProps> {
  private constructor({
    id,
    ...data
  }: DefaultOptionalCreateProps<IEmailProps>) {
    super(data as IEmailProps, id);
  }

  static create(emailProps: DefaultOptionalCreateProps<IEmailProps>): Email {
    return new Email(emailProps);
  }

  unmarshal(): IEmailProps {
    const {
      id,
      to,
      subject,
      html,
      retryCount,
      nextRetryAt,
      status,
      error,
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
      createdAt,
      updatedAt,
      deletedAt,
    };
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

  get status(): EEmailStatus {
    return this.props.status;
  }

  get nextRetryAt(): Undefinedable<Nullable<Date>> {
    return this.props.nextRetryAt;
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

  setError(error: Nullable<string> = null): void {
    this.props.error = error;
  }
}
