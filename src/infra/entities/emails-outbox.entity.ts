import {
  Column,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseTypeOrmEntity } from '@kryuk/ddd-kit/infra/base/base-type-orm.entity';
import { Nullable } from '@kryuk/ddd-kit/domain/types/nullable';
import { EmailsOutbox } from '@domain/entities/emails-outbox';
import { EEmailOutboxStatus } from '@domain/enums/email-outbox-status.enum';

@Entity('emails_outbox')
export class EmailsOutboxEntity extends BaseTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
    array: true,
  })
  toAddresses: string[];

  @Column('text')
  subject: string;

  @Column('text')
  html: string;

  @Column()
  retryCount: number;

  @Column({ type: Date, nullable: true })
  nextRetryAt: Nullable<Date>;

  @Column({ type: Date, nullable: true })
  lockedAt: Nullable<Date>;

  @Column({
    type: 'enum',
    enum: EEmailOutboxStatus,
  })
  status: EEmailOutboxStatus;

  @Column({ type: 'text', nullable: true })
  error: Nullable<string>;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt?: Nullable<Date>;

  toDomain(): EmailsOutbox {
    return EmailsOutbox.create({
      id: this.id,
      to: this.toAddresses,
      subject: this.subject,
      html: this.html,
      retryCount: this.retryCount,
      nextRetryAt: this.nextRetryAt,
      lockedAt: this.lockedAt,
      status: this.status,
      error: this.error,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    });
  }

  static fromDomain(emailsOutbox: EmailsOutbox): EmailsOutboxEntity {
    const self = new EmailsOutboxEntity();

    self.id = emailsOutbox.id;
    self.toAddresses = emailsOutbox.to;
    self.subject = emailsOutbox.subject;
    self.html = emailsOutbox.html;
    self.retryCount = emailsOutbox.retryCount;
    self.nextRetryAt = emailsOutbox.nextRetryAt ?? null;
    self.lockedAt = emailsOutbox.lockedAt ?? null;
    self.status = emailsOutbox.status;
    self.error = emailsOutbox.error ?? null;
    self.createdAt = emailsOutbox.createdAt;
    self.updatedAt = emailsOutbox.updatedAt;
    self.deletedAt = emailsOutbox.deletedAt;

    return self;
  }
}
