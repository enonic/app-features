import * as portal from '/lib/xp/portal';
import * as thymeleaf from '/lib/thymeleaf';
import * as auth from '/lib/xp/auth';
import {assetUrl} from '/lib/enonic/asset';
import type {Request} from '@enonic-types/core';

const view = resolve('websocket.html');

export const GET = function (_req: Request) {
    const content = portal.getContent();

    return {
        contentType: 'text/html',
        body: thymeleaf.render(view, {
            user: auth.getUser(),
            loginUrl: portal.loginUrl({redirect: portal.pageUrl({path: content._path, type: 'absolute'})}),
            logoutUrl: portal.logoutUrl(),
            apiUrl: portal.apiUrl({api: 'com.enonic.app.features:websocket', type: 'websocket'}),
            publicApiUrl: portal.apiUrl({api: 'com.enonic.app.features:websocket-public', type: 'websocket'}),
            scriptUrl: assetUrl({path: 'js/pages/websocket/websocket.js'})
        })
    };
};
