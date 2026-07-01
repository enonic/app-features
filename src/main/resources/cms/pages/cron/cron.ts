import * as portal from '/lib/xp/portal';
import * as thymeleaf from '/lib/thymeleaf';
import {assetUrl} from '/lib/enonic/asset';
import type {Request} from '@enonic-types/core';

const view = resolve('cron.html');

export const GET = function (_req: Request) {
    const cronApiUrl = portal.apiUrl({api: 'com.enonic.app.features:cron'});
    const sseUrl = portal.apiUrl({api: 'com.enonic.app.features:cron-sse'});
    const wsUrl = portal.apiUrl({api: 'com.enonic.app.features:cron-ws'});
    const cronAssetUrl = assetUrl({path: 'js/pages/cron/cron.js'});

    return {
        contentType: 'text/html',
        body: thymeleaf.render(view, {cronApiUrl, sseUrl, wsUrl, assetUrl: cronAssetUrl})
    };
};
