import {requestHandler, RESPONSE_CACHE_CONTROL} from '/lib/enonic/static';
import type {Request, Response} from '@enonic-types/core';

const NO_STORE_PREFIX = '/no-store-demo/';

export const GET = (request: Request): Response => {
    const rawPath = request.rawPath || '';
    const noStore = rawPath.indexOf(NO_STORE_PREFIX) !== -1;

    return requestHandler(request, {
        root: '/assets',
        cacheControl: noStore ? () => RESPONSE_CACHE_CONTROL.DEV : undefined,
    });
};
