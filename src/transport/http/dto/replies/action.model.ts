import { ApiProperty } from '@nestjs/swagger';
import { ApiPropsToSnakeCase } from '@transport/http/swagger/decorators/api-props-to-snake-case.decorator';

@ApiPropsToSnakeCase()
export class ActionModel {
  @ApiProperty({ required: true, description: 'Id сущности' })
  id?: string;

  @ApiProperty({
    required: true,
    description: 'Статус',
    example: `ok || error`,
  })
  status?: string;

  @ApiProperty({
    required: false,
    description: 'Описание ошибки',
  })
  error_message?: string;

  @ApiProperty({
    required: false,
    description: 'Код ошибки',
  })
  error_code?: string;
}
