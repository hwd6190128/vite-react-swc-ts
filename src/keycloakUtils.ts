import Keycloak from 'keycloak-js';
import { setRefreshTokenHandler } from './api/core/HttpClient';

const keycloak = new Keycloak({
  url: 'https://your-keycloak-server/auth', // 請替換為你的 Keycloak server URL
  realm: 'your-realm', // 請替換為你的 realm
  clientId: 'your-client-id', // 請替換為你的 clientId
});

export function registerKeycloakRefreshHandler() {
  setRefreshTokenHandler(async () => {
    const refreshed = await keycloak.updateToken(30);
    if (!refreshed) throw new Error('Unable to refresh token');
    return keycloak.token as string;
  });
}

export function login() {
  return keycloak.login();
}
export function logout() {
  return keycloak.logout();
}
export function getToken() {
  return keycloak.token;
}

export default keycloak; 