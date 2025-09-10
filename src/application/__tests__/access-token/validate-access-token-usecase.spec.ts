import { Test } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { ValidateAccessTokenUseCaseAbstract } from '@application/abstract/access-token/validate-access-token-usecase.abstract';
import { AccessTokenConfigAbstract } from '@application/abstract/configuration/access-token-config.abstract';
import { ValidateAccessTokenUseCase } from '@application/usecases/access-token/validate-access-token.usecase';
import { InputValidationException } from '@kryuk/ddd-kit/application/exceptions/transport/input-validation-exception';
import { ERROR_CODES } from '@kryuk/ddd-kit/domain/constants/error-codes';
import { ValidateAccessTokenDTO } from '@application/dto/access-token/validate-access-token.dto';

describe('Validate Access Token Use Case', () => {
  let accessTokenConfig: AccessTokenConfigAbstract;
  let validateAccessTokenUseCase: ValidateAccessTokenUseCaseAbstract;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: AccessTokenConfigAbstract,
          useValue: {
            accessToken: faker.string.uuid(),
          },
        },
        {
          provide: ValidateAccessTokenUseCaseAbstract,
          useClass: ValidateAccessTokenUseCase,
        },
      ],
    }).compile();

    accessTokenConfig = moduleRef.get<AccessTokenConfigAbstract>(
      AccessTokenConfigAbstract,
    );
    validateAccessTokenUseCase =
      moduleRef.get<ValidateAccessTokenUseCaseAbstract>(
        ValidateAccessTokenUseCaseAbstract,
      );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should throw an exception if empty dto is provided', async () => {
    const validateAccessTokenDTO = {};

    await expect(
      validateAccessTokenUseCase.execute(validateAccessTokenDTO as any),
    ).rejects.toEqual(
      new InputValidationException([
        {
          message: 'accessToken must be a string',
          code: ERROR_CODES.INVALID_INPUT,
        },
      ]),
    );
  });

  it('should throw an exception if incorrect dto is provided', async () => {
    const validateAccessTokenDTO: ValidateAccessTokenDTO = {
      accessToken: NaN as any,
    };

    await expect(
      validateAccessTokenUseCase.execute(validateAccessTokenDTO),
    ).rejects.toEqual(
      new InputValidationException([
        {
          message: 'accessToken must be a string',
          code: ERROR_CODES.INVALID_INPUT,
        },
      ]),
    );
  });

  it('should return false if access tokens are not equal', async () => {
    const validateAccessTokenDTO: ValidateAccessTokenDTO = {
      accessToken: faker.string.uuid(),
    };

    await expect(
      validateAccessTokenUseCase.execute(validateAccessTokenDTO),
    ).resolves.toBe(false);
  });

  it('should return true if access tokens are equal', async () => {
    const validateAccessTokenDTO: ValidateAccessTokenDTO = {
      accessToken: accessTokenConfig.accessToken,
    };

    await expect(
      validateAccessTokenUseCase.execute(validateAccessTokenDTO),
    ).resolves.toBe(true);
  });
});
