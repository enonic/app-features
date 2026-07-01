import * as corsLib from '/lib/enonic/cors';
import type {Request} from '@enonic-types/core';

type CorsConfig = Record<string, string | undefined>;

// The named profiles exercised by both the /cors-demo site mapping and the
// webapp /api/cors route. 'app-config' is not listed here — it exercises the
// convenience wrapper that reads CORS settings from app.config instead.
export const PROFILES: Record<string, CorsConfig> = {
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

export function profileNames(): string[] {
    return Object.keys(PROFILES).concat('app-config');
}

export function resolveProfile(name: string | undefined): string {
    if (name === 'app-config') {
        return name;
    }
    return name && PROFILES[name] ? name : 'default';
}

export function headersFor(name: string, req: Request): Record<string, string> {
    return name === 'app-config'
        ? corsLib.getHeaders(req)
        : corsLib.resolveHeaders(PROFILES[name] || PROFILES.default, req);
}

export function optionsResponseFor(name: string, req: Request) {
    return name === 'app-config'
        ? corsLib.respondOptions(req)
        : corsLib.resolveOptionsResponse(PROFILES[name] || PROFILES.default, req);
}
