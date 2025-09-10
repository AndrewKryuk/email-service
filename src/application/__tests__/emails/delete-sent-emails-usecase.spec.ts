jest.mock('@domain/constants/emails-outbox.constants', () => ({
  ...jest.requireActual('@domain/constants/emails-outbox.constants'),
  CHUNK_SIZE: 1,
}));

import { Test } from '@nestjs/testing';
import { EmailsOutboxRepositoryAbstract } from '@domain/abstract/repositories/emails-outbox-repository.abstract';
import {
  CHUNK_SIZE,
  MAX_SENT_LIFETIME_MS,
} from '@domain/constants/emails-outbox.constants';
import { generateMockEmailsOutbox } from '@application/__tests__/__mocks__/generate-mock-emails-outbox';
import { TransactionServiceAbstract } from '@kryuk/ddd-kit/domain/abstract/services/transaction-service.abstract';
import { DeleteSentEmailsUseCaseAbstract } from '@application/abstract/emails/delete-sent-emails-usecase.abstract';
import { DeleteSentEmailsUseCase } from '@application/usecases/emails/delete-sent-emails.usecase';

describe('Delete Sent Emails Use Case', () => {
  let transactionService: TransactionServiceAbstract;
  let emailsOutboxRepository: EmailsOutboxRepositoryAbstract;
  let deleteSentEmailsUseCase: DeleteSentEmailsUseCaseAbstract;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
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
            findExpiredSentChunk: jest.fn(),
            bulkDelete: jest.fn(),
          },
        },
        {
          provide: DeleteSentEmailsUseCaseAbstract,
          useClass: DeleteSentEmailsUseCase,
        },
      ],
    }).compile();

    transactionService = moduleRef.get<TransactionServiceAbstract>(
      TransactionServiceAbstract,
    );
    emailsOutboxRepository = moduleRef.get<EmailsOutboxRepositoryAbstract>(
      EmailsOutboxRepositoryAbstract,
    );
    deleteSentEmailsUseCase = moduleRef.get<DeleteSentEmailsUseCaseAbstract>(
      DeleteSentEmailsUseCaseAbstract,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should call execute() without exceptions', async () => {
    const now = Date.now();
    const emailsOutboxFirstMock = generateMockEmailsOutbox({
      createdAt: new Date(now + 1),
    });
    const emailsOutboxSecondMock = generateMockEmailsOutbox({
      createdAt: new Date(now + 2),
    });

    const withTransactionSpy = jest.spyOn(
      transactionService,
      'withTransaction',
    );
    const findExpiredSentChunkSpy = jest
      .spyOn(emailsOutboxRepository, 'findExpiredSentChunk')
      .mockResolvedValueOnce([emailsOutboxFirstMock])
      .mockResolvedValueOnce([emailsOutboxSecondMock])
      .mockResolvedValueOnce([]);
    const bulkDeleteSpy = jest
      .spyOn(emailsOutboxRepository, 'bulkDelete')
      .mockResolvedValue({
        deletedCount: 1,
      });
    jest.spyOn(Date, 'now').mockReturnValue(now);

    await expect(deleteSentEmailsUseCase.execute()).resolves.toEqual({
      deletedCount: 2,
    });

    expect(withTransactionSpy).toHaveBeenCalledTimes(3);
    expect(findExpiredSentChunkSpy).toHaveBeenCalledTimes(3);
    expect(findExpiredSentChunkSpy).toHaveBeenNthCalledWith(
      1,
      new Date(Date.now() - MAX_SENT_LIFETIME_MS),
      CHUNK_SIZE,
      undefined,
    );
    expect(findExpiredSentChunkSpy).toHaveBeenNthCalledWith(
      2,
      new Date(Date.now() - MAX_SENT_LIFETIME_MS),
      CHUNK_SIZE,
      emailsOutboxFirstMock.createdAt,
    );
    expect(findExpiredSentChunkSpy).toHaveBeenNthCalledWith(
      3,
      new Date(Date.now() - MAX_SENT_LIFETIME_MS),
      CHUNK_SIZE,
      emailsOutboxSecondMock.createdAt,
    );
    expect(bulkDeleteSpy).toHaveBeenCalledTimes(2);
    expect(bulkDeleteSpy).toHaveBeenNthCalledWith(1, [emailsOutboxFirstMock]);
    expect(bulkDeleteSpy).toHaveBeenNthCalledWith(2, [emailsOutboxSecondMock]);
  });
});
