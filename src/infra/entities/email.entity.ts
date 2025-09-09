import {
  Column,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseTypeOrmEntity } from '@kryuk/ddd-kit/infra/base/base-type-orm.entity';
import { Nullable } from '@kryuk/ddd-kit/domain/types/nullable';
import { EEmailStatus } from '@domain/enums/email-status.enum';
import { Email } from '@domain/entities/email';

@Entity('emails')
export class EmailEntity extends BaseTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('simple-array')
  toAddresses: string[];

  @Column('text')
  subject: string;

  @Column('text')
  html: string;

  @Column()
  retryCount: number;

  @Column({ type: Date, nullable: true })
  nextRetryAt: Nullable<Date>;

  @Column({
    type: 'enum',
    enum: EEmailStatus,
  })
  status: EEmailStatus;

  @Column({ type: 'text', nullable: true })
  error: Nullable<string>;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt?: Nullable<Date>;

  toDomain(): Email {
    return Email.create({
      id: this.id,
      to: this.toAddresses,
      subject: this.subject,
      html: this.html,
      retryCount: this.retryCount,
      nextRetryAt: this.nextRetryAt,
      status: this.status,
      error: this.error,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    });
  }

  static fromDomain(email: Email): EmailEntity {
    const self = new EmailEntity();

    self.id = email.id;
    self.toAddresses = email.to;
    self.subject = email.subject;
    self.html = email.html;
    self.retryCount = email.retryCount;
    self.nextRetryAt = email.nextRetryAt ?? null;
    self.status = email.status;
    self.error = email.error ?? null;
    self.createdAt = email.createdAt;
    self.updatedAt = email.updatedAt;
    self.deletedAt = email.deletedAt;

    return self;
  }
}
