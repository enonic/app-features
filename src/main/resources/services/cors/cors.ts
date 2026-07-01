import * as corsDemo from '/lib/cors-demo';
import type {Request} from '@enonic-types/core';

function handleGet(req: Request) {
    const name = corsDemo.resolveProfile(req.params.profile as string | undefined);
    const headers = corsDemo.headersFor(name, req);
    return {
        status: 200,
        contentType: 'application/json',
        headers: {
            ...headers,
            'X-Request-Id': 'demo-' + Date.now(),
            'X-Demo-Header': 'cors-demo'
        },
        body: {
            profile: name,
            method: req.method,
            origin: req.headers['Origin'] || null,
            corsHeaders: headers
        }
    };
}

function handleOptions(req: Request) {
    const name = corsDemo.resolveProfile(req.params.profile as string | undefined);
    return corsDemo.optionsResponseFor(name, req);
}

export {handleGet as GET};
export {handleGet as POST};
export {handleOptions as OPTIONS};
