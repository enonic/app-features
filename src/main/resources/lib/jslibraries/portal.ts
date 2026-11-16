import {assetUrl as assetLibAssetUrl} from '/lib/enonic/asset';

export function assetUrl() {
    const url = assetLibAssetUrl({
        path: 'error/css/custom.css',
    });

    return url;
}

export function attachmentUrl() {
    const portal = require('/lib/xp/portal');

    const url = portal.attachmentUrl({
        id: "5a5fc786-a4e6-4a4d-a21a-19ac6fd4784b",
        download: true
    });

    return url;
}

export function componentUrl() {
    const portal = require('/lib/xp/portal');

    const url = portal.componentUrl({
        component: 'main/0'
    });

    return url;
}

export function imageUrl() {
    const portal = require('/lib/xp/portal');

    const url = portal.imageUrl({
        id: '5a5fc786-a4e6-4a4d-a21a-19ac6fd4784b',
        scale: 'block(1024,768)',
        filter: 'rounded(5);sharpen()',
    });

    return url;
}

export function pageUrl() {
    const portal = require('/lib/xp/portal');

    const url = portal.pageUrl({
        path: '/features/js-libraries/portal',
        params: {
            a: 1,
            b: [1, 2]
        }
    });

    return url;
}

export function serviceUrl() {
    const portal = require('/lib/xp/portal');

    const url = portal.serviceUrl({
        service: 'test',
        params: {
            a: 1,
            b: 2
        }
    });

    return url;
}

export function processHtml() {
    const portal = require('/lib/xp/portal');

    const processedHtml = portal.processHtml({
        value: '<a href="content://221e3218-aaeb-4798-885c-d33a06a2b295" target="">Content</a>' +
               '<a href="media://inline/5a5fc786-a4e6-4a4d-a21a-19ac6fd4784b" target="">Inline</a>' +
               '<a href="media://download/5a5fc786-a4e6-4a4d-a21a-19ac6fd4784b" target="">Download</a>'
    });

    return processedHtml;
}
