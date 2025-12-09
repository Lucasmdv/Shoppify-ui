import { Secrets } from "./secrets";

export const environment = {
  production: false,
  apiUrl: Secrets.apiUrl,
  mpPk: Secrets.mpPk,
  appName: 'Shoppify-UI'
};
