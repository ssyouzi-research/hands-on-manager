import { URL } from 'url';
import { createRemoteJWKSet, jwtVerify } from 'jose';

const clientId = process.env.CLIENT_ID;
const jwksUrl = process.env.JWKS_URL;
const issuer = process.env.ISSUER;

const jwks = createRemoteJWKSet(new URL(jwksUrl));

export const verifyOidcToken = async (token) => {
    const { payload } = await jwtVerify(token, jwks, {
      'issuer': issuer,
      'audience': clientId
    });
    return payload;
};
