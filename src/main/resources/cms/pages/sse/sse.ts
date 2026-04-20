import * as portal from '/lib/xp/portal';
import * as thymeleaf from '/lib/thymeleaf';
import type {Request} from '@enonic-types/core';

const view = resolve('sse.html');

export const GET = function (_req: Request) {
    const apiUrl = portal.apiUrl({api: 'com.enonic.app.features:sse'});
    const mappingUrl = portal.pageUrl({path: portal.getSite()?._path + '/sse-mapping'});
    const assetUrl = portal.assetUrl({path: 'js/pages/sse/sse.js'});

    return {
        contentType: 'text/html',
        body: thymeleaf.render(view, {apiUrl, mappingUrl, assetUrl})
    };
};
