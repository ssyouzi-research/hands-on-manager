import { codeflow } from './codeflow.js';
import { getConsoleUrl } from './console.js';
import { findByEmail } from './findbyemail.js';
import { verifyOidcToken } from './verify.js';
import { listUsersByCourse } from './list.js';

export const handler = async (event) => {
    console.log(JSON.stringify(event));
    const path = event.requestContext.http.path.split('/');
    console.log(JSON.stringify(path));
    if (path.length <= 1 || path[1] !== 'api' || path.length > 4) {
        return {
            'statusCode': 404,
            'body': 'Not Found'
        };        
    }
    const resourceName = path.pop();
    const method = event.requestContext.http.method;
    const hasCookie = async (f) => {
        const cookie = event.cookies;
        if (cookie) {
            const cookies = cookie[0].split(';');
            for (let i = 0; i < cookies.length; i++) {
                const keyValue = cookies[i].split('=');
                const key = keyValue[0].trim();
                const value = keyValue[1].trim();
                if (key == 'id_token') {
                    const payload = await verifyOidcToken(value);
                    return f(payload, value);
                }
            } 
        }
        return false;
    }
    if (resourceName === 'callback' && method === 'GET') {
        try {
            const { code, state } = event.queryStringParameters || {};
        
            if (!code) {
                return {
                    'statusCode': 400,
                    'body': JSON.stringify({ 'error': 'Authorization code is required' })
                };
            }

            const { payload, id_token } = await codeflow(code);
            const course_id = path.length == 4 ? path[2] : 'test';

            return {
                'statusCode': 302,
                'statusDescription': 'Found',
                'headers': {
                    'location': `${process.env.ADMIN_UI_URL}#course_id=${course_id}`,
                    'set-cookie': `id_token=${id_token}; Path=/; Secure; HttpOnly`
                }
            }
        } catch (error) {
            console.error('Error:', error);
            return {
                'statusCode': 500,
                'body': JSON.stringify({ 'error': 'Internal server error', 'message': error.message })
            };
        }
    }
    if (resourceName === 'profile' && method === 'GET') {
        const profile = await hasCookie(async (payload) => {
            return {
                'email': payload.email
            };
        });
        if (!profile) {
            return {
                'statusCode': 401,
                'body': 'Unauthorized'
            };
        }
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json'
            },
            'body': JSON.stringify(profile)
        };
    }
    if (resourceName === 'findByEmail' && method === 'GET') {
        const { course_id } = event.queryStringParameters || {};
        const data = await hasCookie(async (payload) => {
            const data = await findByEmail(payload.email, course_id);
            return data;
        });
        if (!data) {
            return {
                'statusCode': 401,
                'body': 'Unauthorized'
            };
        }
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json'
            },
            'body': JSON.stringify(data)
        };
    }
    if (resourceName === 'students' && method === 'GET') {
        const { course_id } = event.queryStringParameters || {};
        const data = await hasCookie(async (payload) => {
            const data = await listUsersByCourse(course_id, 'student');
            return data;
        });
        if (!data) {
            return {
                'statusCode': 401,
                'body': 'Unauthorized'
            };
        }
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json'
            },
            'body': JSON.stringify(data)
        };        
    }
    if (resourceName === 'console' && method === 'GET') {
        const rolearn = event.queryStringParameters.rolearn;
        const location = await hasCookie(async (payload, id_token) => {
            return await getConsoleUrl(rolearn, id_token, payload.email);
        });
        if (!location) {
            return {
                'statusCode': 401,
                'body': 'Unauthorized'
            };
        }
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json'
            },
            'body': JSON.stringify({ 'location': location })
        };
    }
    return {
        'statusCode': 404,
        'body': 'Not Found'
    };
};
