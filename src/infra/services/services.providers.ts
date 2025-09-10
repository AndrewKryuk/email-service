import { Provider } from '@nestjs/common';
import { transactionServiceProvider } from '@kryuk/ddd-kit/infra/services/services.providers';

export const servicesProviders: Provider[] = [transactionServiceProvider];
