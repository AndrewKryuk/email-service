import { ActionModel } from './action.model';
import { ResultReply } from '@kryuk/ddd-kit/application/dto/common/result.reply';
import { ApiPropsToSnakeCase } from '@transport/http/swagger/decorators/api-props-to-snake-case.decorator';

@ApiPropsToSnakeCase()
export class ActionReply extends ResultReply(ActionModel, {
  description: 'Результат действия над сущностью',
}) {}
