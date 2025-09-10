import { cleanEnv, str } from 'envalid';
import { ApplicationConfigAbstract } from '@application/abstract/configuration/application-config.abstract';

export const applicationConfigFactory: () => ApplicationConfigAbstract = () => {
  const env = cleanEnv(process.env, {
    SERVICE_NAME: str(),
    NODE_ENV: str<ApplicationConfigAbstract['nodeEnv']>(),
  });

  return {
    serviceName: env.SERVICE_NAME,
    nodeEnv: env.NODE_ENV,
  };
};
