import { NotFoundException as BaseNotFoundException } from '@kryuk/ddd-kit/application/exceptions/domain/not-found-exception';
import { ERROR_CODES } from '@domain/constants/error-codes';

export class NotFoundException extends BaseNotFoundException {
  constructor(message: string) {
    super([{ message, code: ERROR_CODES.NOT_FOUND }]);
  }
}
