import { DECORATORS } from '@nestjs/swagger/dist/constants';
import { Type } from '@nestjs/common';

/**
 * Is used to transform API properties from camelCase to snake_case
 */
export const ApiPropsToSnakeCase = () => (dto: Type) => {
  const apiProperties = Reflect.getMetadata(
    DECORATORS.API_MODEL_PROPERTIES_ARRAY,
    dto.prototype,
  );

  if (apiProperties) {
    for (let apiProperty of apiProperties) {
      apiProperty = apiProperty.replace(':', '');

      const apiModelProperties = Reflect.getMetadata(
        DECORATORS.API_MODEL_PROPERTIES,
        dto.prototype,
        apiProperty,
      );

      apiModelProperties.name = apiProperty
        .split(/(?=[A-Z])/)
        .join('_')
        .toLowerCase();

      Reflect.defineMetadata(
        DECORATORS.API_MODEL_PROPERTIES,
        apiModelProperties,
        dto.prototype,
        apiProperty,
      );
    }
  }
};
