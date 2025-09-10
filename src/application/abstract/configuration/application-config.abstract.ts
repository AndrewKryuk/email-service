/**
 * Application configuration
 */
export abstract class ApplicationConfigAbstract {
  serviceName: string;
  nodeEnv: 'production' | 'development' | 'local';
}
