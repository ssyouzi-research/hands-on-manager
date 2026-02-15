import https from 'https';
import querystring from 'querystring';
import { URL } from 'url';
import { verifyOidcToken } from './verify.js';

const tokenEndpoint = process.env.TOKEN_ENDPOINT;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URI;

export const codeflow = async (code) => {
    const tokenResponse = await exchangeCodeForTokens(code);
    console.log('Token Response:', JSON.stringify(tokenResponse));

    const payload = await verifyOidcToken(tokenResponse.id_token);
    console.log('Verified Token Payload:', JSON.stringify(payload));

    return {
        'payload': payload,
        'id_token': tokenResponse.id_token
    }
};

const exchangeCodeForTokens = async (code) => {
    const postData = querystring.stringify({
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': redirectUri,
        'client_id': clientId,
        'client_secret': clientSecret
    });

    const url = new URL(tokenEndpoint);

    return new Promise((resolve, reject) => {
        const options = {
            hostname: url.hostname,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        console.log('Request options:', options);

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log('Response status:', res.statusCode);
                console.log('Response body:', data);
                if (res.statusCode === 200) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`Token exchange failed: ${res.statusCode} - ${data}`));
                }
            });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
    });
};
