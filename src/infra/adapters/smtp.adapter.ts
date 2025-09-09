import { EmailAdapterAbstract } from '@domain/abstract/adapters/email-adapter.abstract';
import { Injectable } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { Log } from '@kryuk/ddd-kit/application/decorators/log.decorator';
import { ISendEmailOptions } from '@domain/interfaces/send-email-options.interface';

@Injectable()
export class SmtpAdapter implements EmailAdapterAbstract {
  @Log({ level: 'debug' })
  async sendEmail(_options: ISendEmailOptions): Promise<{ result: boolean }> {
    return { result: faker.datatype.boolean() };
  }
}
