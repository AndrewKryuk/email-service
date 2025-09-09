import { SendEmailDTO } from '@application/dto/emails/send-email.dto';
import { ActionResult } from '@kryuk/ddd-kit/domain/interfaces/action-result.interface';

/**
 * is used to send email
 */
export abstract class SendEmailUseCaseAbstract {
  abstract execute(sendEmailDTO: SendEmailDTO): Promise<ActionResult>;
}
