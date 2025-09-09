import { ArrayMinSize, IsArray, IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { faker } from '@faker-js/faker';

export class SendEmailDTO {
  @ApiProperty({
    required: true,
    description: 'Массив емейл адресов получателей',
    example: [faker.internet.email(), faker.internet.email()],
  })
  @IsArray()
  @IsEmail({}, { each: true })
  @ArrayMinSize(1)
  to: string[];

  @ApiProperty({
    required: true,
    description: 'Тема письма',
    example: faker.lorem.word(),
  })
  @IsString()
  subject: string;

  @ApiProperty({
    required: true,
    description: 'Html контент письма',
    example: `<p>${faker.lorem.sentence()}</p>`,
  })
  @IsString()
  html: string;
}
