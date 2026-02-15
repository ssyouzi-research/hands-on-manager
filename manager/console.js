import querystring from 'querystring';
import { STSClient, AssumeRoleWithWebIdentityCommand } from "@aws-sdk/client-sts";

const region = process.env.AWS_REGION || 'us-east-1';
const stsClient = new STSClient({ 'region': region });

export const getConsoleUrl = async (rolearn, id_token, session_name) => {
    const credentials = await assumeRoleWithWebIdentity(
        rolearn,
        id_token,
        session_name
    );
    console.log('Assumed Role Credentials:', JSON.stringify(credentials));

    const signinToken = await getSigninToken(credentials);
    const destination = encodeURIComponent('https://console.aws.amazon.com');

    return `https://signin.aws.amazon.com/federation?Action=login&Issuer=gmail.com&Destination=${destination}&SigninToken=${signinToken}`;
};

const assumeRoleWithWebIdentity = async (roleArn, webIdentityToken, email) => {
    const command = new AssumeRoleWithWebIdentityCommand({
        'RoleArn': roleArn,
        'RoleSessionName': email,
        'WebIdentityToken': webIdentityToken,
        'DurationSeconds': 3600
    });

    const response = await stsClient.send(command);
    return {
        'sessionId': response.Credentials.AccessKeyId,
        'sessionKey': response.Credentials.SecretAccessKey,
        'sessionToken': response.Credentials.SessionToken
    };
};

const getSigninToken = async (credentials) => {
    const query = querystring.stringify({
        'Action': 'getSigninToken',
        'Session': JSON.stringify(credentials),
        'SessionDuration': 43200
    });

    const req = `https://signin.aws.amazon.com/federation?${query}`;
    const res = await fetch(req);
    const text = await res.text();
    return JSON.parse(text)['SigninToken'];
};
