import { ApiProperty } from '@nestjs/swagger';
import { faker } from '@faker-js/faker';
import { SendEmailDTO } from '@application/dto/emails/send-email.dto';
import { ApiPropsToSnakeCase } from '@transport/http/swagger/decorators/api-props-to-snake-case.decorator';

@ApiPropsToSnakeCase()
export class SendEmailRequest extends SendEmailDTO {
  @ApiProperty({
    required: true,
    description: 'Массив емейл адресов получателей',
    example: [faker.internet.email(), faker.internet.email()],
  })
  to: string[];

  @ApiProperty({
    required: true,
    description: 'Тема письма',
    example: faker.lorem.word(),
  })
  subject: string;

  @ApiProperty({
    required: true,
    description: 'Html контент письма',
    example: `<p>${faker.lorem.sentence()}</p>`,
  })
  html: string;
}
