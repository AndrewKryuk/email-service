import { Injectable } from '@nestjs/common';
import { LessThan, MoreThanOrEqual, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailsOutboxEntity } from '@infra/entities/emails-outbox.entity';
import { EmailsOutbox } from '@domain/entities/emails-outbox';
import { EmailsOutboxRepositoryAbstract } from '@domain/abstract/repositories/emails-outbox-repository.abstract';
import { BaseTypeOrmRepository } from '@kryuk/ddd-kit/infra/base/base-type-orm.repository';
import { Log } from '@kryuk/ddd-kit/application/decorators/log.decorator';
import { EEmailOutboxStatus } from '@domain/enums/email-outbox-status.enum';

@Injectable()
export class EmailsOutboxRepository
  extends BaseTypeOrmRepository<EmailsOutboxEntity, EmailsOutbox>
  implements EmailsOutboxRepositoryAbstract
{
  constructor(
    @InjectRepository(EmailsOutboxEntity)
    private readonly emailsOutboxRepository: Repository<EmailsOutboxEntity>,
  ) {
    super(emailsOutboxRepository);
  }

  @Log({ level: 'debug' })
  async findFailedChunk(
    maxRetryCount: number,
    beforeNextRetryAt: Date,
    limit: number,
    lastCreatedAt?: Date,
  ): Promise<EmailsOutbox[]> {
    const emailEntities = await this.emailsOutboxRepository.find({
      where: {
        status: EEmailOutboxStatus.failed,
        retryCount: LessThan(maxRetryCount),
        nextRetryAt: LessThan(beforeNextRetryAt),
        ...(lastCreatedAt ? { createdAt: MoreThanOrEqual(lastCreatedAt) } : {}),
      },
      order: {
        createdAt: 'asc',
      },
      take: limit,
      lock: {
        mode: 'pessimistic_write',
        tables: ['emails_outbox'],
        onLocked: 'skip_locked',
      },
    });

    return emailEntities.map((emailEntity) => emailEntity.toDomain());
  }

  @Log({ level: 'debug' })
  async findLockedChunk(
    beforeLockedAt: Date,
    limit: number,
    lastCreatedAt?: Date,
  ): Promise<EmailsOutbox[]> {
    const emailEntities = await this.emailsOutboxRepository.find({
      where: {
        status: EEmailOutboxStatus.processing,
        lockedAt: LessThan(beforeLockedAt),
        ...(lastCreatedAt ? { createdAt: MoreThanOrEqual(lastCreatedAt) } : {}),
      },
      order: {
        createdAt: 'asc',
      },
      take: limit,
      lock: {
        mode: 'pessimistic_write',
        tables: ['emails_outbox'],
        onLocked: 'skip_locked',
      },
    });

    return emailEntities.map((emailEntity) => emailEntity.toDomain());
  }

  @Log({ level: 'debug' })
  async findExpiredSentChunk(
    beforeUpdatedAt: Date,
    limit: number,
    lastCreatedAt?: Date,
  ): Promise<EmailsOutbox[]> {
    const emailEntities = await this.emailsOutboxRepository.manager.find(
      EmailsOutboxEntity,
      {
        where: {
          status: EEmailOutboxStatus.sent,
          updatedAt: LessThan(beforeUpdatedAt),
          ...(lastCreatedAt
            ? { createdAt: MoreThanOrEqual(lastCreatedAt) }
            : {}),
        },
        order: {
          createdAt: 'asc',
        },
        take: limit,
        lock: {
          mode: 'pessimistic_write',
          tables: ['emails_outbox'],
          onLocked: 'skip_locked',
        },
      },
    );

    return emailEntities.map((emailEntity) => emailEntity.toDomain());
  }
}
