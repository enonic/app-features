import * as thymeleaf from '/lib/thymeleaf';
import * as portal from '/lib/xp/portal';
import {assetUrl} from '/lib/enonic/asset';
import type { ErrorRequest } from '@enonic-types/core';

const view404 = resolve('404.html');
const viewGeneric = resolve('default.html');

export const handle404 = function (err: ErrorRequest) {
    const debugMode = err.request.params.debug === 'true';
    if (debugMode && (err.request.mode === 'preview' || err.request.mode === 'edit')) {
        return null;
    }

    const params = {
        cssUrl: assetUrl({path: 'error/css/custom.css'}),
        imgNotFoundUrl: assetUrl({path: 'error/img/no-nick.svg'}),
        siteRootUrl: portal.pageUrl({path: '/features'}),
    };
    const body = thymeleaf.render(view404, params);

    return {
        contentType: 'text/html',
        body: body
    };
};

// Several demos write to the repository or only work on one branch. Naming the likely cause here
// saves the reader a trip to the server log, and applies to every controller in the app.
function hintFor(message: string): string | null {
    if (!message) {
        return null;
    }
    if (message.indexOf('Access denied') !== -1) {
        return 'This looks like a permission problem. Some demos write to the repository, which needs an administrator: sign in to the XP admin and reload.';
    }
    if (message.indexOf('Branch must be draft') !== -1) {
        return 'This demo only works on the draft branch. Open it under /site/<project>/draft/ instead of master.';
    }
    return null;
}

export const handleError = function (err: ErrorRequest) {
    log.error('Error: %s', JSON.stringify(err, null, 2));
    const debugMode = err.request.params.debug === 'true';
    if (debugMode && (err.request.mode === 'preview' || err.request.mode === 'edit')) {
        return null;
    }

    const params = {
        errorCode: err.status,
        message: err.message,
        hint: hintFor(err.message),
        cssUrl: assetUrl({path: 'error/css/custom.css'}),
        imgErrorUrl: assetUrl({path: 'error/img/nick-hanging-from-cloud.svg'}),
        siteRootUrl: portal.pageUrl({path: '/features'}),
    };
    const body = thymeleaf.render(viewGeneric, params);

    return {
        contentType: 'text/html',
        body: body
    };
};
