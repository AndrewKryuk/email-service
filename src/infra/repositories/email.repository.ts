import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailEntity } from '@infra/entities/email.entity';
import { Email } from '@domain/entities/email';
import { EmailRepositoryAbstract } from '@domain/abstract/repositories/email-repository.abstract';
import { BaseTypeOrmRepository } from '@kryuk/ddd-kit/infra/base/base-type-orm.repository';

@Injectable()
export class EmailRepository
  extends BaseTypeOrmRepository<EmailEntity, Email>
  implements EmailRepositoryAbstract
{
  constructor(
    @InjectRepository(EmailEntity)
    private readonly emailRepository: Repository<EmailEntity>,
  ) {
    super(emailRepository);
  }
}
