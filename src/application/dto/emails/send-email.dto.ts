import { ArrayMinSize, IsArray, IsEmail, IsString } from 'class-validator';

export class SendEmailDTO {
  @IsArray()
  @IsEmail({}, { each: true })
  @ArrayMinSize(1)
  to: string[];

  @IsString()
  subject: string;

  @IsString()
  html: string;
}
