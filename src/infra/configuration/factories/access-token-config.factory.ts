import { cleanEnv, str } from 'envalid';
import { AccessTokenConfigAbstract } from '@application/abstract/configuration/access-token-config.abstract';

export const accessTokenConfigFactory: () => AccessTokenConfigAbstract = () => {
  const env = cleanEnv(process.env, {
    ACCESS_TOKEN: str(),
  });

  return {
    accessToken: env.ACCESS_TOKEN,
  };
};
