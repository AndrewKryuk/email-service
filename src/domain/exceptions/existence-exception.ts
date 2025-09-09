import { ConflictException } from '@kryuk/ddd-kit/application/exceptions/domain/conflict-exception';
import { ERROR_CODES } from '@domain/constants/error-codes';

export class ExistenceException extends ConflictException {
  constructor(message: string) {
    super([{ message, code: ERROR_CODES.EXISTENCE }]);
  }
}
