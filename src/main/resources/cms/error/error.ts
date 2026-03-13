const thymeleaf = require('/lib/thymeleaf') as any;
import * as portal from '/lib/xp/portal';

const view404 = resolve('404.html');
const viewGeneric = resolve('default.html');

export const handle404 = function(err: any) {
    const debugMode = err.request.params.debug === 'true';
    if (debugMode && (err.request.mode === 'preview' || err.request.mode === 'edit')) {
        return null;
    }

    const params = {
        cssUrl: portal.assetUrl({path: 'error/css/custom.css'}),
        imgNotFoundUrl: portal.assetUrl({path: 'error/img/no-nick.svg'}),
        siteRootUrl: portal.pageUrl({path: '/features'}),
    };
    const body = thymeleaf.render(view404, params);

    return {
        contentType: 'text/html',
        body: body
    };
};

export const handleError = function(err: any) {
    log.error("Error:" + JSON.stringify(err, null, 2));
    const debugMode = err.request.params.debug === 'true';
    if (debugMode && (err.request.mode === 'preview' || err.request.mode === 'edit')) {
        return null;
    }

    const params = {
        errorCode: err.status,
        cssUrl: portal.assetUrl({path: 'error/css/custom.css'}),
        imgErrorUrl: portal.assetUrl({path: 'error/img/nick-hanging-from-cloud.svg'}),
        siteRootUrl: portal.pageUrl({path: '/features'}),
    };
    const body = thymeleaf.render(viewGeneric, params);

    return {
        contentType: 'text/html',
        body: body
    };
};
