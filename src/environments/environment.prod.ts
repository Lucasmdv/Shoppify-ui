import { Secrets } from "./secrets";

export const environment = {
  production: true,
  apiUrl: Secrets.apiUrl,
  mpPk: Secrets.mpPk,
  appName: 'Shoppify-UI'
};
