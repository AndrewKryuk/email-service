import { Test } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { InputValidationException } from '@kryuk/ddd-kit/application/exceptions/transport/input-validation-exception';
import {
  ERROR_CODE,
  ERROR_CODES,
  SUCCEED_CODE,
} from '@kryuk/ddd-kit/domain/constants/error-codes';
import { SendEmailUseCaseAbstract } from '@application/abstract/emails/send-email-usecase.abstract';
import { EmailAdapterAbstract } from '@domain/abstract/adapters/email-adapter.abstract';
import { EmailsOutboxRepositoryAbstract } from '@domain/abstract/repositories/emails-outbox-repository.abstract';
import { SendEmailUseCase } from '@application/usecases/emails/send-email.usecase';
import { SendEmailDTO } from '@application/dto/emails/send-email.dto';
import { EmailsOutbox } from '@domain/entities/emails-outbox';
import { EEmailOutboxStatus } from '@domain/enums/email-outbox-status.enum';
import { NEXT_RETRY_DURATION_MS } from '@domain/constants/emails-outbox.constants';
import { generateMockEmailsOutbox } from '@application/__tests__/__mocks__/generate-mock-emails-outbox';

describe('Send Email Use Case', () => {
  let emailAdapter: EmailAdapterAbstract;
  let emailsOutboxRepository: EmailsOutboxRepositoryAbstract;
  let sendEmailUseCase: SendEmailUseCaseAbstract;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: EmailAdapterAbstract,
          useValue: {
            sendEmail: jest.fn(),
          },
        },
        {
          provide: EmailsOutboxRepositoryAbstract,
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: SendEmailUseCaseAbstract,
          useClass: SendEmailUseCase,
        },
      ],
    }).compile();

    emailAdapter = moduleRef.get<EmailAdapterAbstract>(EmailAdapterAbstract);
    emailsOutboxRepository = moduleRef.get<EmailsOutboxRepositoryAbstract>(
      EmailsOutboxRepositoryAbstract,
    );
    sendEmailUseCase = moduleRef.get<SendEmailUseCaseAbstract>(
      SendEmailUseCaseAbstract,
    );

    jest.resetAllMocks();
  });

  it('should throw an exception if empty dto is provided', async () => {
    const sendEmailDTO = {};

    await expect(sendEmailUseCase.execute(sendEmailDTO as any)).rejects.toEqual(
      new InputValidationException([
        {
          message: 'to must contain at least 1 elements',
          code: ERROR_CODES.INVALID_INPUT,
        },
        {
          message: 'each value in to must be an email',
          code: ERROR_CODES.INVALID_INPUT,
        },
        {
          message: 'to must be an array',
          code: ERROR_CODES.INVALID_INPUT,
        },
        {
          message: 'subject must be a string',
          code: ERROR_CODES.INVALID_INPUT,
        },
        {
          message: 'html must be a string',
          code: ERROR_CODES.INVALID_INPUT,
        },
      ]),
    );
  });

  it('should throw an exception if incorrect dto is provided', async () => {
    const sendEmailDTO: SendEmailDTO = {
      to: NaN as any,
      subject: NaN as any,
      html: NaN as any,
    };

    await expect(sendEmailUseCase.execute(sendEmailDTO)).rejects.toEqual(
      new InputValidationException([
        {
          message: 'to must contain at least 1 elements',
          code: ERROR_CODES.INVALID_INPUT,
        },
        {
          message: 'each value in to must be an email',
          code: ERROR_CODES.INVALID_INPUT,
        },
        {
          message: 'to must be an array',
          code: ERROR_CODES.INVALID_INPUT,
        },
        {
          message: 'subject must be a string',
          code: ERROR_CODES.INVALID_INPUT,
        },
        {
          message: 'html must be a string',
          code: ERROR_CODES.INVALID_INPUT,
        },
      ]),
    );
  });

  it('should call execute() without exceptions if email is not sent', async () => {
    const sendEmailDTO: SendEmailDTO = {
      to: [faker.internet.email()],
      subject: faker.lorem.word(),
      html: `<p>${faker.lorem.sentence()}</p>`,
    };
    const now = Date.now();
    const emailOutboxMock = generateMockEmailsOutbox({
      to: sendEmailDTO.to,
      subject: sendEmailDTO.subject,
      html: sendEmailDTO.html,
      status: EEmailOutboxStatus.failed,
      retryCount: 0,
      nextRetryAt: new Date(now + NEXT_RETRY_DURATION_MS),
    });

    const sendEmailSpy = jest
      .spyOn(emailAdapter, 'sendEmail')
      .mockResolvedValue({ result: false });
    const emailsOutboxCreateSpy = jest
      .spyOn(EmailsOutbox, 'create')
      .mockReturnValue(emailOutboxMock);
    const emailOutboxSaveSpy = jest.spyOn(emailsOutboxRepository, 'save');
    jest.spyOn(Date, 'now').mockReturnValue(now);

    await expect(sendEmailUseCase.execute(sendEmailDTO)).resolves.toEqual({
      id: emailOutboxMock.id,
      status: ERROR_CODE,
    });

    expect(sendEmailSpy).toHaveBeenCalledWith(sendEmailDTO);
    expect(emailsOutboxCreateSpy).toHaveBeenCalledWith({
      to: sendEmailDTO.to,
      subject: sendEmailDTO.subject,
      html: sendEmailDTO.html,
      status: EEmailOutboxStatus.failed,
      retryCount: 0,
      nextRetryAt: new Date(now + NEXT_RETRY_DURATION_MS),
    });
    expect(emailOutboxSaveSpy).toHaveBeenCalledWith(emailOutboxMock);
  });

  it('should call execute() without exceptions if email is sent', async () => {
    const sendEmailDTO: SendEmailDTO = {
      to: [faker.internet.email()],
      subject: faker.lorem.word(),
      html: `<p>${faker.lorem.sentence()}</p>`,
    };
    const emailOutboxMock = generateMockEmailsOutbox({
      to: sendEmailDTO.to,
      subject: sendEmailDTO.subject,
      html: sendEmailDTO.html,
      status: EEmailOutboxStatus.sent,
      retryCount: 0,
    });

    const sendEmailSpy = jest
      .spyOn(emailAdapter, 'sendEmail')
      .mockResolvedValue({ result: true });
    const emailsOutboxCreateSpy = jest
      .spyOn(EmailsOutbox, 'create')
      .mockReturnValue(emailOutboxMock);
    const emailOutboxSaveSpy = jest.spyOn(emailsOutboxRepository, 'save');

    await expect(sendEmailUseCase.execute(sendEmailDTO)).resolves.toEqual({
      id: emailOutboxMock.id,
      status: SUCCEED_CODE,
    });

    expect(sendEmailSpy).toHaveBeenCalledWith(sendEmailDTO);
    expect(emailsOutboxCreateSpy).toHaveBeenCalledWith({
      to: sendEmailDTO.to,
      subject: sendEmailDTO.subject,
      html: sendEmailDTO.html,
      status: EEmailOutboxStatus.sent,
      retryCount: 0,
    });
    expect(emailOutboxSaveSpy).toHaveBeenCalledWith(emailOutboxMock);
  });

  it('should call execute() without exceptions if sendEmail rejected', async () => {
    const sendEmailDTO: SendEmailDTO = {
      to: [faker.internet.email()],
      subject: faker.lorem.word(),
      html: `<p>${faker.lorem.sentence()}</p>`,
    };
    const now = Date.now();
    const emailOutboxMock = generateMockEmailsOutbox({
      to: sendEmailDTO.to,
      subject: sendEmailDTO.subject,
      html: sendEmailDTO.html,
      status: EEmailOutboxStatus.failed,
      retryCount: 0,
      nextRetryAt: new Date(now + NEXT_RETRY_DURATION_MS),
    });
    const errorMessage = faker.lorem.sentence();

    const sendEmailSpy = jest
      .spyOn(emailAdapter, 'sendEmail')
      .mockRejectedValue(new Error(errorMessage));
    const emailsOutboxCreateSpy = jest
      .spyOn(EmailsOutbox, 'create')
      .mockReturnValue(emailOutboxMock);
    const emailsOutboxSetErrorSpy = jest.spyOn(emailOutboxMock, 'setError');
    const emailOutboxSaveSpy = jest.spyOn(emailsOutboxRepository, 'save');
    jest.spyOn(Date, 'now').mockReturnValue(now);

    await expect(sendEmailUseCase.execute(sendEmailDTO)).resolves.toEqual({
      id: emailOutboxMock.id,
      status: ERROR_CODE,
      errorMessage,
    });

    expect(sendEmailSpy).toHaveBeenCalledWith(sendEmailDTO);
    expect(emailsOutboxCreateSpy).toHaveBeenCalledWith({
      to: sendEmailDTO.to,
      subject: sendEmailDTO.subject,
      html: sendEmailDTO.html,
      status: EEmailOutboxStatus.failed,
      retryCount: 0,
      nextRetryAt: new Date(now + NEXT_RETRY_DURATION_MS),
    });
    expect(emailsOutboxSetErrorSpy).toHaveBeenCalledWith(errorMessage);
    expect(emailOutboxSaveSpy).toHaveBeenCalledWith(emailOutboxMock);
  });
});
