var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');
var portalJsLib = require('/lib/jslibraries/portal');
var view = resolve('js-libraries-portal.html');

function handleGet() {
    var pageUrlResult = portalJsLib.pageUrl();

    var params = {
        assetUrlResultDefault: portalJsLib.assetUrl(),
        assetUrlResultRelative: portalJsLib.assetUrl('relative'),
        assetUrlResultVhost: portalJsLib.assetUrl('vhost'),
        attachmentUrlResult: portalJsLib.attachmentUrl(),
        componentUrlResult: portalJsLib.componentUrl(),
        imageUrlResultDefault: portalJsLib.imageUrl(),
        imageUrlResultRelative: portalJsLib.imageUrl('relative'),
        imageUrlResultVhost: portalJsLib.imageUrl('vhost'),
        pageUrlResult: portalJsLib.pageUrl(),
        serviceUrlResultDefault: portalJsLib.serviceUrl(),
        serviceUrlResultRelative: portalJsLib.serviceUrl('relative'),
        serviceUrlResultVhost: portalJsLib.serviceUrl('vhost'),
        idProviderUrlResultDefault: portal.idProviderUrl(),
        idProviderUrlResultRelative: portal.idProviderUrl({contextPath: 'relative'}),
        idProviderUrlResultVhost: portal.idProviderUrl({contextPath: 'vhost'}),
        loginUrlResultDefault: portal.loginUrl({redirect: pageUrlResult}),
        loginUrlResultRelative: portal.loginUrl({redirect: pageUrlResult, contextPath: 'relative'}),
        loginUrlResultVhost: portal.loginUrl({redirect: pageUrlResult, contextPath: 'vhost'}),
        logoutUrlResultDefault: portal.logoutUrl({redirect: pageUrlResult}),
        logoutUrlResultRelative: portal.logoutUrl({redirect: pageUrlResult, contextPath: 'relative'}),
        logoutUrlResultVhost: portal.logoutUrl({redirect: pageUrlResult, contextPath: 'vhost'}),
        processHtmlResult: JSON.stringify(portalJsLib.processHtml(), null, 4),
        getUserStoreKeyResult: portal.getUserStoreKey(),
        imagePlaceholder: portal.imagePlaceholder({width: 64,height: 32})
    };

    var body = thymeleaf.render(view, params);

    return {
        RelativeType: 'text/html',
        body: body
    };
}

exports.get = handleGet;