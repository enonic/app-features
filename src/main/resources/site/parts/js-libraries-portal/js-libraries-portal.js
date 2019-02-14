var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/thymeleaf');
var portalJsLib = require('/lib/jslibraries/portal');
var view = resolve('js-libraries-portal.html');

function handleGet() {
    var pageUrlResult = portalJsLib.pageUrl();

    var params = {
        assetUrlResultDefault: portalJsLib.assetUrl(),
        assetUrlResultContent: portalJsLib.assetUrl('relative'),
        assetUrlResultRoot: portalJsLib.assetUrl('vhost'),
        attachmentUrlResult: portalJsLib.attachmentUrl(),
        componentUrlResult: portalJsLib.componentUrl(),
        imageUrlResultDefault: portalJsLib.imageUrl(),
        imageUrlResultContent: portalJsLib.imageUrl('relative'),
        imageUrlResultRoot: portalJsLib.imageUrl('vhost'),
        pageUrlResult: pageUrlResult,
        serviceUrlResultDefault: portalJsLib.serviceUrl(),
        serviceUrlResultContent: portalJsLib.serviceUrl('relative'),
        serviceUrlResultRoot: portalJsLib.serviceUrl('vhost'),
        idProviderUrlResultDefault: portal.idProviderUrl(),
        idProviderUrlResultContent: portal.idProviderUrl({contextPath: 'relative'}),
        idProviderUrlResultRoot: portal.idProviderUrl({contextPath: 'vhost'}),
        loginUrlResultDefault: portal.loginUrl({redirect: pageUrlResult}),
        loginUrlResultContent: portal.loginUrl({redirect: pageUrlResult, contextPath: 'relative'}),
        loginUrlResultRoot: portal.loginUrl({redirect: pageUrlResult, contextPath: 'vhost'}),
        logoutUrlResultDefault: portal.logoutUrl({redirect: pageUrlResult}),
        logoutUrlResultContent: portal.logoutUrl({redirect: pageUrlResult, contextPath: 'relative'}),
        logoutUrlResultRoot: portal.logoutUrl({redirect: pageUrlResult, contextPath: 'vhost'}),
        processHtmlResult: JSON.stringify(portalJsLib.processHtml(), null, 4),
        getIdProviderKeyResult: portal.getIdProviderKey(),
        imagePlaceholder: portal.imagePlaceholder({width: 64,height: 32})
    };

    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

exports.get = handleGet;