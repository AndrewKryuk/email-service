import { ValidateAccessTokenDTO } from '@application/dto/access-token/validate-access-token.dto';

/**
 * Is used to validate access token
 */
export abstract class ValidateAccessTokenUseCaseAbstract {
  abstract execute(
    validateAccessTokenDTO: ValidateAccessTokenDTO,
  ): Promise<boolean>;
}
