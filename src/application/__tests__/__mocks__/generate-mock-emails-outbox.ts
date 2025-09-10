import { faker } from '@faker-js/faker/locale/af_ZA';
import { IEmailOutboxProps } from '@domain/entity-props/emails-outbox-props.interface';
import { EmailsOutbox } from '@domain/entities/emails-outbox';
import { EEmailOutboxStatus } from '@domain/enums/email-outbox-status.enum';

export const generateMockEmailsOutbox = (
  props: Partial<IEmailOutboxProps> = {},
): EmailsOutbox =>
  EmailsOutbox.create({
    to: [faker.internet.email()],
    subject: faker.lorem.word(),
    html: `<p>${faker.lorem.sentence()}</p>`,
    status: EEmailOutboxStatus.sent,
    retryCount: 0,
    nextRetryAt: faker.date.birthdate(),
    ...props,
  });
