import { Injectable } from '@nestjs/common';
import { ValidateAccessTokenUseCaseAbstract } from '@application/abstract/access-token/validate-access-token-usecase.abstract';
import { Redact } from '@kryuk/ddd-kit/application/decorators/redact.decorator';
import { Log } from '@kryuk/ddd-kit/application/decorators/log.decorator';
import { validateDTO } from '@kryuk/ddd-kit/application/validation/decorators/validate-dto.decorator';
import { DTO } from '@kryuk/ddd-kit/application/validation/decorators/dto.decorator';
import { ValidateAccessTokenDTO } from '@application/dto/access-token/validate-access-token.dto';
import { AccessTokenConfigAbstract } from '@application/abstract/configuration/access-token-config.abstract';

@Injectable()
export class ValidateAccessTokenUseCase
  implements ValidateAccessTokenUseCaseAbstract
{
  constructor(private readonly accessTokenConfig: AccessTokenConfigAbstract) {}

  @Redact(['args[0].accessToken'])
  @Log({ level: 'debug' })
  @validateDTO()
  async execute(
    @DTO() { accessToken }: ValidateAccessTokenDTO,
  ): Promise<boolean> {
    return this.accessTokenConfig.accessToken === accessToken;
  }
}
