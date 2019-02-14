exports.assetUrl = function (contextPath) {

    //Documentation BEGIN
    var portal = require('/lib/xp/portal');

    var url = portal.assetUrl({
        path: 'error/css/custom.css',
        contextPath: contextPath
    });
    //Documentation END

    log.info('AssetUrl result: ' + JSON.stringify(url, null, 4));

    return url;
};

exports.attachmentUrl = function () {

    //Documentation BEGIN
    var portal = require('/lib/xp/portal');

    var url = portal.attachmentUrl({
        id: "5a5fc786-a4e6-4a4d-a21a-19ac6fd4784b",
        download: true
    });
    //Documentation END

    log.info('AttachmentUrl result: ' + JSON.stringify(url, null, 4));

    return url;
};

exports.componentUrl = function () {

    //Documentation BEGIN
    var portal = require('/lib/xp/portal');

    var url = portal.componentUrl({
        component: 'main/0'
    });
    //Documentation END

    log.info('ComponentUrl result: ' + JSON.stringify(url, null, 4));

    return url;
};

exports.imageUrl = function (contextPath) {

    //Documentation BEGIN
    var portal = require('/lib/xp/portal');

    var url = portal.imageUrl({
        id: '5a5fc786-a4e6-4a4d-a21a-19ac6fd4784b',
        scale: 'block(1024,768)',
        filter: 'rounded(5);sharpen()',
        contextPath: contextPath
    });
    //Documentation END

    log.info('ImageUrl result: ' + JSON.stringify(url, null, 4));

    return url;
};

exports.pageUrl = function () {

    //Documentation BEGIN
    var portal = require('/lib/xp/portal');

    var url = portal.pageUrl({
        path: '/features/js-libraries/portal',
        params: {
            a: 1,
            b: [1, 2]
        }
    });
    //Documentation END

    log.info('PageUrl result: ' + JSON.stringify(url, null, 4));

    return url;
};

exports.serviceUrl = function (contextPath) {

    //Documentation BEGIN
    var portal = require('/lib/xp/portal');

    var url = portal.serviceUrl({
        service: 'test',
        contextPath: contextPath,
        params: {
            a: 1,
            b: 2
        }
    });
    //Documentation END

    log.info('ServiceUrl result: ' + JSON.stringify(url, null, 4));

    return url;
};

exports.processHtml = function () {

    //Documentation BEGIN
    var portal = require('/lib/xp/portal');

    var processedHtml = portal.processHtml({
        value: '<a href="content://221e3218-aaeb-4798-885c-d33a06a2b295" target="">Content</a>' +
               '<a href="media://inline/5a5fc786-a4e6-4a4d-a21a-19ac6fd4784b" target="">Inline</a>' +
               '<a href="media://download/5a5fc786-a4e6-4a4d-a21a-19ac6fd4784b" target="">Download</a>'
    });
    //Documentation END

    log.info('ProcessHtml result: ' + JSON.stringify(processedHtml, null, 4));

    return processedHtml;
};

