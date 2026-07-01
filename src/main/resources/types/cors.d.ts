declare module '/lib/enonic/cors' {
    import type {Request} from '@enonic-types/core';

    type CorsConfig = Record<string, string | undefined>;
    type CorsHeaders = Record<string, string>;
    type CorsResponse = {
        status: number;
        headers: CorsHeaders;
    };

    export function resolveHeaders(config: CorsConfig, req: Request): CorsHeaders;
    export function getHeaders(req: Request): CorsHeaders;
    export function resolveOptionsResponse(config: CorsConfig, req: Request): CorsResponse;
    export function respondOptions(req: Request): CorsResponse;
}

export {};
