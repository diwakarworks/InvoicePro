import { Auth0Provider } from '@auth0/auth0-react';

function MyApp({ Component, pageProps }) {
  return (
    <Auth0Provider
      domain="invoicelypro.us.auth0.com"
      clientId="jLpGUYPKz1wAi8dOdzUmpHMOcCq1kUTr"
      authorizationParams={{
        redirect_uri: "http://localhost:3000/auth/callback",
        audience: "https://invoicelypro/api",
        scope: "openid profile email",
      }}
    >
      <Component {...pageProps} />
    </Auth0Provider>
  );
}

export default MyApp;
