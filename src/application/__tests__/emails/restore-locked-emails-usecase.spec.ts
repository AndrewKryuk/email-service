import { RestoreLockedEmailsUseCaseAbstract } from '@application/abstract/emails/restore-locked-emails-usecase.abstract';
import { Test } from '@nestjs/testing';
import { EmailsOutboxRepositoryAbstract } from '@domain/abstract/repositories/emails-outbox-repository.abstract';
import {
  CHUNK_SIZE,
  MAX_LOCKED_TIME_MS,
} from '@domain/constants/emails-outbox.constants';
import { generateMockEmailsOutbox } from '@application/__tests__/__mocks__/generate-mock-emails-outbox';
import { TransactionServiceAbstract } from '@kryuk/ddd-kit/domain/abstract/services/transaction-service.abstract';
import { RestoreLockedEmailsUseCase } from '@application/usecases/emails/restore-locked-emails.usecase';
import { EEmailOutboxStatus } from '@domain/enums/email-outbox-status.enum';

jest.mock('@domain/constants/emails-outbox.constants', () => ({
  ...jest.requireActual('@domain/constants/emails-outbox.constants'),
  CHUNK_SIZE: 1,
}));

describe('Restore Locked Emails Use Case', () => {
  let transactionService: TransactionServiceAbstract;
  let emailsOutboxRepository: EmailsOutboxRepositoryAbstract;
  let restoreLockedEmailsUseCase: RestoreLockedEmailsUseCaseAbstract;

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
            findLockedChunk: jest.fn(),
            bulkSave: jest.fn(),
          },
        },
        {
          provide: RestoreLockedEmailsUseCaseAbstract,
          useClass: RestoreLockedEmailsUseCase,
        },
      ],
    }).compile();

    transactionService = moduleRef.get<TransactionServiceAbstract>(
      TransactionServiceAbstract,
    );
    emailsOutboxRepository = moduleRef.get<EmailsOutboxRepositoryAbstract>(
      EmailsOutboxRepositoryAbstract,
    );
    restoreLockedEmailsUseCase =
      moduleRef.get<RestoreLockedEmailsUseCaseAbstract>(
        RestoreLockedEmailsUseCaseAbstract,
      );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should call execute() without exceptions', async () => {
    const now = Date.now();
    const emailsOutboxFirstMock = generateMockEmailsOutbox({
      createdAt: new Date(now + 1),
      status: EEmailOutboxStatus.processing,
    });
    const emailsOutboxSecondMock = generateMockEmailsOutbox({
      createdAt: new Date(now + 2),
      status: EEmailOutboxStatus.processing,
    });

    const withTransactionSpy = jest.spyOn(
      transactionService,
      'withTransaction',
    );
    const findLockedChunkSpy = jest
      .spyOn(emailsOutboxRepository, 'findLockedChunk')
      .mockResolvedValueOnce([emailsOutboxFirstMock])
      .mockResolvedValueOnce([emailsOutboxSecondMock])
      .mockResolvedValueOnce([]);
    const bulkSaveSpy = jest.spyOn(emailsOutboxRepository, 'bulkSave');
    jest.spyOn(Date, 'now').mockReturnValue(now);

    await expect(restoreLockedEmailsUseCase.execute()).resolves.toEqual({
      restoredCount: 2,
    });

    expect(withTransactionSpy).toHaveBeenCalledTimes(3);
    expect(findLockedChunkSpy).toHaveBeenCalledTimes(3);
    expect(findLockedChunkSpy).toHaveBeenNthCalledWith(
      1,
      new Date(Date.now() - MAX_LOCKED_TIME_MS),
      CHUNK_SIZE,
      undefined,
    );
    expect(findLockedChunkSpy).toHaveBeenNthCalledWith(
      2,
      new Date(Date.now() - MAX_LOCKED_TIME_MS),
      CHUNK_SIZE,
      emailsOutboxFirstMock.createdAt,
    );
    expect(findLockedChunkSpy).toHaveBeenNthCalledWith(
      3,
      new Date(Date.now() - MAX_LOCKED_TIME_MS),
      CHUNK_SIZE,
      emailsOutboxSecondMock.createdAt,
    );
    expect(bulkSaveSpy).toHaveBeenCalledTimes(2);
    expect(bulkSaveSpy).toHaveBeenNthCalledWith(1, [emailsOutboxFirstMock]);
    expect(bulkSaveSpy).toHaveBeenNthCalledWith(2, [emailsOutboxSecondMock]);
  });
});
