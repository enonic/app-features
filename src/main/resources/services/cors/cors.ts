import * as corsLib from '/lib/enonic/cors';
import type {Request} from '@enonic-types/core';

type CorsConfig = Record<string, string | undefined>;

const PROFILES: Record<string, CorsConfig> = {
    default: {
        'cors.origin': 'https://example.test, https://allowed.test',
        'cors.credentials': 'true',
        'cors.allowedHeaders': 'Content-Type, Authorization, X-Demo',
        'cors.methods': 'GET, POST, PUT, DELETE',
        'cors.exposedHeaders': 'X-Request-Id, X-Demo-Header',
        'cors.maxAge': '3600'
    },
    wildcard: {
        'cors.origin': '*',
        'cors.methods': 'GET, POST'
    },
    'reflect-any': {
        'cors.origin': '~.*',
        'cors.credentials': 'true'
    },
    'regex-subdomain': {
        'cors.origin': '~https://.*\\.example\\.test'
    },
    disabled: {}
};

function profileName(req: Request): string {
    return (req.params.profile as string) || 'default';
}

function pickConfig(req: Request): CorsConfig {
    const name = profileName(req);
    return PROFILES[name] || PROFILES.default;
}

function handleGet(req: Request) {
    const name = profileName(req);
    // 'app-config' profile exercises the convenience wrapper that reads from app.config.
    const headers = name === 'app-config'
        ? corsLib.getHeaders(req)
        : corsLib.resolveHeaders(pickConfig(req), req);
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
    const name = profileName(req);
    return name === 'app-config'
        ? corsLib.respondOptions(req)
        : corsLib.resolveOptionsResponse(pickConfig(req), req);
}

export {handleGet as GET};
export {handleGet as POST};
export {handleOptions as OPTIONS};
