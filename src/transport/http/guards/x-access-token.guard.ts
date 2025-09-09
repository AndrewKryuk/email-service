import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ValidateAccessTokenUseCaseAbstract } from '@application/abstract/access-token/validate-access-token-usecase.abstract';
import { UnauthorizedException } from '@kryuk/ddd-kit/application/exceptions/infra/unauthorized-exception';
import { ERROR_CODES } from '@kryuk/ddd-kit/domain/constants/error-codes';

@Injectable()
export class XAccessTokenGuard implements CanActivate {
  constructor(
    private readonly validateAccessTokenUseCase: ValidateAccessTokenUseCaseAbstract,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const accessToken =
      request.headers?.['x-access-token'] ?? request?.headers['X-Access-Token'];

    if (!accessToken) {
      this.throwError('X-Access-Token not provided');
    }

    return await this.validateAccessTokenUseCase.execute({
      accessToken,
    });
  }

  private throwError(message = 'Invalid X-Access-Token') {
    throw new UnauthorizedException([
      {
        message,
        code: ERROR_CODES.HTTP_UNAUTHORIZED,
      },
    ]);
  }
}
