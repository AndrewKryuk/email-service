import { Body, Controller, Post, UseGuards, UsePipes } from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiSecurity,
  ApiResponse,
} from '@nestjs/swagger';
import { XAccessTokenGuard } from '@transport/http/guards/x-access-token.guard';
import { SendEmailUseCaseAbstract } from '@application/abstract/emails/send-email-usecase.abstract';
import { InputValidationPipe } from '@kryuk/ddd-kit/transport/pipes/input-validation.pipe';
import { ActionReply } from '@transport/http/dto/replies/action.reply';
import { SendEmailDTO } from '@application/dto/emails/send-email.dto';

@ApiTags('Emails')
@ApiSecurity('x-access-token')
@UsePipes(InputValidationPipe)
@UseGuards(XAccessTokenGuard)
@Controller({
  version: '1',
  path: 'emails',
})
export class EmailsController {
  constructor(private readonly sendEmailUseCase: SendEmailUseCaseAbstract) {}

  @Post('send')
  @ApiOperation({ summary: 'Отправить email' })
  @ApiResponse({
    type: ActionReply,
  })
  async sendEmail(@Body() sendEmailDTO: SendEmailDTO): Promise<ActionReply> {
    return { result: await this.sendEmailUseCase.execute(sendEmailDTO) };
  }
}
