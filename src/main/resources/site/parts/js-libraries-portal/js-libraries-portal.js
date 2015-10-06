var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');
var portalJsLib = require('/lib/jslibraries/portal');
var view = resolve('js-libraries-portal.html');

function handleGet(req) {

    var assetUrlResult = JSON.stringify(portalJsLib.assetUrl(), null, 4);
    var attachmentUrlResult = JSON.stringify(portalJsLib.attachmentUrl(), null, 4);
    var componentUrlResult = JSON.stringify(portalJsLib.componentUrl(), null, 4);
    var imageUrlResult = JSON.stringify(portalJsLib.imageUrl(), null, 4);
    var pageUrlResult = JSON.stringify(portalJsLib.pageUrl(), null, 4);
    var serviceUrlResult = JSON.stringify(portalJsLib.serviceUrl(), null, 4);
    var processHtmlResult = JSON.stringify(portalJsLib.processHtml(), null, 4);

    var params = {
        assetUrlResult: assetUrlResult,
        attachmentUrlResult: attachmentUrlResult,
        componentUrlResult: componentUrlResult,
        imageUrlResult: imageUrlResult,
        pageUrlResult: pageUrlResult,
        serviceUrlResult: serviceUrlResult,
        processHtmlResult: processHtmlResult
    };

    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

exports.get = handleGet;