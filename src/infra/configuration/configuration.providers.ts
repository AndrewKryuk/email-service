import { Provider } from '@nestjs/common';
import {
  httpConfigProvider,
  typeormConfigProvider,
} from '@kryuk/ddd-kit/infra/configuration/configuration.providers';

export const configurationProviders: Provider[] = [
  httpConfigProvider,
  typeormConfigProvider,
];
