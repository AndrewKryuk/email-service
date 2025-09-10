import { Test } from '@nestjs/testing';
import { EmailsOutboxRepositoryAbstract } from '@domain/abstract/repositories/emails-outbox-repository.abstract';
import {
  CHUNK_SIZE,
  MAX_RETRY_COUNT,
} from '@domain/constants/emails-outbox.constants';
import { generateMockEmailsOutbox } from '@application/__tests__/__mocks__/generate-mock-emails-outbox';
import { TransactionServiceAbstract } from '@kryuk/ddd-kit/domain/abstract/services/transaction-service.abstract';
import { EmailAdapterAbstract } from '@domain/abstract/adapters/email-adapter.abstract';
import { SendFailedEmailsUseCaseAbstract } from '@application/abstract/emails/send-failed-emails-usecase.abstract';
import { SendFailedEmailsUseCase } from '@application/usecases/emails/send-failed-emails.usecase';
import { faker } from '@faker-js/faker';

jest.mock('@domain/constants/emails-outbox.constants', () => ({
  ...jest.requireActual('@domain/constants/emails-outbox.constants'),
  CHUNK_SIZE: 1,
}));

describe('Send Failed Emails Use Case', () => {
  let emailAdapter: EmailAdapterAbstract;
  let transactionService: TransactionServiceAbstract;
  let emailsOutboxRepository: EmailsOutboxRepositoryAbstract;
  let sendFailedEmailsUseCase: SendFailedEmailsUseCaseAbstract;

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
          provide: TransactionServiceAbstract,
          useValue: {
            withTransaction: jest
              .fn()
              .mockImplementation(async (callback: () => Promise<void>) =>
                callback(),
              ),
          },
        },
        {
          provide: EmailsOutboxRepositoryAbstract,
          useValue: {
            findFailedChunk: jest.fn(),
            bulkSave: jest.fn(),
          },
        },
        {
          provide: SendFailedEmailsUseCaseAbstract,
          useClass: SendFailedEmailsUseCase,
        },
      ],
    }).compile();

    emailAdapter = moduleRef.get<EmailAdapterAbstract>(EmailAdapterAbstract);
    transactionService = moduleRef.get<TransactionServiceAbstract>(
      TransactionServiceAbstract,
    );
    emailsOutboxRepository = moduleRef.get<EmailsOutboxRepositoryAbstract>(
      EmailsOutboxRepositoryAbstract,
    );
    sendFailedEmailsUseCase = moduleRef.get<SendFailedEmailsUseCaseAbstract>(
      SendFailedEmailsUseCaseAbstract,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should call execute() without exceptions if email is not sent', async () => {
    const now = Date.now();
    const emailsOutboxMock = generateMockEmailsOutbox({
      createdAt: new Date(now + 1),
    });

    const withTransactionSpy = jest.spyOn(
      transactionService,
      'withTransaction',
    );
    const findFailedChunkSpy = jest
      .spyOn(emailsOutboxRepository, 'findFailedChunk')
      .mockResolvedValueOnce([emailsOutboxMock])
      .mockResolvedValueOnce([]);
    const markAsProcessingSpy = jest.spyOn(
      emailsOutboxMock,
      'markAsProcessing',
    );
    const bulkSaveSpy = jest.spyOn(emailsOutboxRepository, 'bulkSave');
    const sendEmailSpy = jest
      .spyOn(emailAdapter, 'sendEmail')
      .mockResolvedValue({ result: false });
    const markAsFailedSpy = jest.spyOn(emailsOutboxMock, 'markAsFailed');
    const increaseRetrySpy = jest.spyOn(emailsOutboxMock, 'increaseRetry');
    jest.spyOn(Date, 'now').mockReturnValue(now);

    await expect(sendFailedEmailsUseCase.execute()).resolves.toEqual({
      sentCount: 0,
      failedCount: 1,
    });

    expect(withTransactionSpy).toHaveBeenCalledTimes(2);
    expect(findFailedChunkSpy).toHaveBeenCalledTimes(2);
    expect(findFailedChunkSpy).toHaveBeenNthCalledWith(
      1,
      MAX_RETRY_COUNT,
      new Date(now),
      CHUNK_SIZE,
      undefined,
    );
    expect(findFailedChunkSpy).toHaveBeenNthCalledWith(
      2,
      MAX_RETRY_COUNT,
      new Date(now),
      CHUNK_SIZE,
      emailsOutboxMock.createdAt,
    );
    expect(markAsProcessingSpy).toHaveBeenCalled();
    expect(bulkSaveSpy).toHaveBeenCalledTimes(2);
    expect(bulkSaveSpy).toHaveBeenNthCalledWith(1, [emailsOutboxMock]);
    expect(sendEmailSpy).toHaveBeenCalledWith({
      to: emailsOutboxMock.to,
      subject: emailsOutboxMock.subject,
      html: emailsOutboxMock.html,
    });
    expect(markAsFailedSpy).toHaveBeenCalled();
    expect(increaseRetrySpy).toHaveBeenCalled();
    expect(bulkSaveSpy).toHaveBeenNthCalledWith(2, [emailsOutboxMock]);
  });

  it('should call execute() without exceptions if sendEmail rejected', async () => {
    const now = Date.now();
    const emailsOutboxMock = generateMockEmailsOutbox({
      createdAt: new Date(now + 1),
    });
    const errorMessage = faker.lorem.sentence();

    const withTransactionSpy = jest.spyOn(
      transactionService,
      'withTransaction',
    );
    const findFailedChunkSpy = jest
      .spyOn(emailsOutboxRepository, 'findFailedChunk')
      .mockResolvedValueOnce([emailsOutboxMock])
      .mockResolvedValueOnce([]);
    const markAsProcessingSpy = jest.spyOn(
      emailsOutboxMock,
      'markAsProcessing',
    );
    const bulkSaveSpy = jest.spyOn(emailsOutboxRepository, 'bulkSave');
    const sendEmailSpy = jest
      .spyOn(emailAdapter, 'sendEmail')
      .mockRejectedValue(new Error(errorMessage));
    const markAsFailedSpy = jest.spyOn(emailsOutboxMock, 'markAsFailed');
    const setErrorSpy = jest.spyOn(emailsOutboxMock, 'setError');
    const increaseRetrySpy = jest.spyOn(emailsOutboxMock, 'increaseRetry');
    jest.spyOn(Date, 'now').mockReturnValue(now);

    await expect(sendFailedEmailsUseCase.execute()).resolves.toEqual({
      sentCount: 0,
      failedCount: 1,
    });

    expect(withTransactionSpy).toHaveBeenCalledTimes(2);
    expect(findFailedChunkSpy).toHaveBeenCalledTimes(2);
    expect(findFailedChunkSpy).toHaveBeenNthCalledWith(
      1,
      MAX_RETRY_COUNT,
      new Date(now),
      CHUNK_SIZE,
      undefined,
    );
    expect(findFailedChunkSpy).toHaveBeenNthCalledWith(
      2,
      MAX_RETRY_COUNT,
      new Date(now),
      CHUNK_SIZE,
      emailsOutboxMock.createdAt,
    );
    expect(markAsProcessingSpy).toHaveBeenCalled();
    expect(bulkSaveSpy).toHaveBeenCalledTimes(2);
    expect(bulkSaveSpy).toHaveBeenNthCalledWith(1, [emailsOutboxMock]);
    expect(sendEmailSpy).toHaveBeenCalledWith({
      to: emailsOutboxMock.to,
      subject: emailsOutboxMock.subject,
      html: emailsOutboxMock.html,
    });
    expect(markAsFailedSpy).toHaveBeenCalled();
    expect(setErrorSpy).toHaveBeenCalledWith(errorMessage);
    expect(increaseRetrySpy).toHaveBeenCalled();
    expect(bulkSaveSpy).toHaveBeenNthCalledWith(2, [emailsOutboxMock]);
  });

  it('should call execute() without exceptions if email is sent', async () => {
    const now = Date.now();
    const emailsOutboxMock = generateMockEmailsOutbox({
      createdAt: new Date(now + 1),
    });

    const withTransactionSpy = jest.spyOn(
      transactionService,
      'withTransaction',
    );
    const findFailedChunkSpy = jest
      .spyOn(emailsOutboxRepository, 'findFailedChunk')
      .mockResolvedValueOnce([emailsOutboxMock])
      .mockResolvedValueOnce([]);
    const markAsProcessingSpy = jest.spyOn(
      emailsOutboxMock,
      'markAsProcessing',
    );
    const bulkSaveSpy = jest.spyOn(emailsOutboxRepository, 'bulkSave');
    const sendEmailSpy = jest
      .spyOn(emailAdapter, 'sendEmail')
      .mockResolvedValue({ result: true });
    const markAsSentSpy = jest.spyOn(emailsOutboxMock, 'markAsSent');
    const increaseRetrySpy = jest.spyOn(emailsOutboxMock, 'increaseRetry');
    jest.spyOn(Date, 'now').mockReturnValue(now);

    await expect(sendFailedEmailsUseCase.execute()).resolves.toEqual({
      sentCount: 1,
      failedCount: 0,
    });

    expect(withTransactionSpy).toHaveBeenCalledTimes(2);
    expect(findFailedChunkSpy).toHaveBeenCalledTimes(2);
    expect(findFailedChunkSpy).toHaveBeenNthCalledWith(
      1,
      MAX_RETRY_COUNT,
      new Date(now),
      CHUNK_SIZE,
      undefined,
    );
    expect(findFailedChunkSpy).toHaveBeenNthCalledWith(
      2,
      MAX_RETRY_COUNT,
      new Date(now),
      CHUNK_SIZE,
      emailsOutboxMock.createdAt,
    );
    expect(markAsProcessingSpy).toHaveBeenCalled();
    expect(bulkSaveSpy).toHaveBeenCalledTimes(2);
    expect(bulkSaveSpy).toHaveBeenNthCalledWith(1, [emailsOutboxMock]);
    expect(sendEmailSpy).toHaveBeenCalledWith({
      to: emailsOutboxMock.to,
      subject: emailsOutboxMock.subject,
      html: emailsOutboxMock.html,
    });
    expect(markAsSentSpy).toHaveBeenCalled();
    expect(increaseRetrySpy).toHaveBeenCalled();
    expect(bulkSaveSpy).toHaveBeenNthCalledWith(2, [emailsOutboxMock]);
  });

  it('should call execute() without exceptions if max retry count exceeded', async () => {
    const now = Date.now();
    const emailsOutboxMock = generateMockEmailsOutbox({
      createdAt: new Date(now + 1),
      retryCount: MAX_RETRY_COUNT - 1,
    });

    const markAsMaxRetriesExceededSpy = jest.spyOn(
      emailsOutboxMock,
      'markAsMaxRetriesExceeded',
    );
    jest
      .spyOn(emailsOutboxRepository, 'findFailedChunk')
      .mockResolvedValueOnce([emailsOutboxMock])
      .mockResolvedValueOnce([]);
    jest.spyOn(emailAdapter, 'sendEmail').mockResolvedValue({ result: false });
    jest.spyOn(Date, 'now').mockReturnValue(now);

    await expect(sendFailedEmailsUseCase.execute()).resolves.toEqual({
      sentCount: 0,
      failedCount: 1,
    });

    expect(markAsMaxRetriesExceededSpy).toHaveBeenCalled();
  });
});
