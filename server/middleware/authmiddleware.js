const {expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');

const domain = process.env.AUTH0_DOMAIN;
const audience = process.env.AUTH0_AUDIENCE;


module.exports = jwt({

    secret: jwksRsa.expressJwtSecret({
        jwksUri: `https://${domain}/.well-known/jwks.json`,
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
    }),
    audience: audience,
    issuer: `https://${domain}/`,
    algorithms: ['RS256']
})


