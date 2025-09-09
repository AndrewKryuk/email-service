import { IsString } from 'class-validator';

export class ValidateAccessTokenDTO {
  @IsString()
  accessToken: string;
}
