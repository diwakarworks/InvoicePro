import { createAuth0Client } from '@auth0/auth0-spa-js';

export const getAuth0Client = async () => {
  const config = {
    domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN,
    clientId: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID,
    authorizationParams: {
      redirect_uri: process.env.NEXT_PUBLIC_AUTH0_REDIRECT_URI,
      audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE, // Add this line
      scope: 'openid profile email' // Also recommended to be explicit
    },
    cacheLocation: 'localstorage',
    useRefreshTokens: true
  };

  console.log('Auth0 Config:', config);
  
  
  return await createAuth0Client(config);
};