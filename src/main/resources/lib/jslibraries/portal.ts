export function assetUrl(contextPath?: any) {
    const portal = require('/lib/xp/portal');

    const url = (portal as any).assetUrl({
        path: 'error/css/custom.css',
        contextPath: contextPath
    });

    log.info('AssetUrl result: ' + JSON.stringify(url, null, 4));

    return url;
}

export function attachmentUrl() {
    const portal = require('/lib/xp/portal');

    const url = portal.attachmentUrl({
        id: "5a5fc786-a4e6-4a4d-a21a-19ac6fd4784b",
        download: true
    });

    log.info('AttachmentUrl result: ' + JSON.stringify(url, null, 4));

    return url;
}

export function componentUrl() {
    const portal = require('/lib/xp/portal');

    const url = portal.componentUrl({
        component: 'main/0'
    });

    log.info('ComponentUrl result: ' + JSON.stringify(url, null, 4));

    return url;
}

export function imageUrl(contextPath?: any) {
    const portal = require('/lib/xp/portal');

    const url = (portal as any).imageUrl({
        id: '5a5fc786-a4e6-4a4d-a21a-19ac6fd4784b',
        scale: 'block(1024,768)',
        filter: 'rounded(5);sharpen()',
        contextPath: contextPath
    });

    log.info('ImageUrl result: ' + JSON.stringify(url, null, 4));

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

    log.info('PageUrl result: ' + JSON.stringify(url, null, 4));

    return url;
}

export function serviceUrl(contextPath?: any) {
    const portal = require('/lib/xp/portal');

    const url = (portal as any).serviceUrl({
        service: 'test',
        contextPath: contextPath,
        params: {
            a: 1,
            b: 2
        }
    });

    log.info('ServiceUrl result: ' + JSON.stringify(url, null, 4));

    return url;
}

export function processHtml() {
    const portal = require('/lib/xp/portal');

    const processedHtml = portal.processHtml({
        value: '<a href="content://221e3218-aaeb-4798-885c-d33a06a2b295" target="">Content</a>' +
               '<a href="media://inline/5a5fc786-a4e6-4a4d-a21a-19ac6fd4784b" target="">Inline</a>' +
               '<a href="media://download/5a5fc786-a4e6-4a4d-a21a-19ac6fd4784b" target="">Download</a>'
    });

    log.info('ProcessHtml result: ' + JSON.stringify(processedHtml, null, 4));

    return processedHtml;
}
