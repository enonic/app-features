var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');
var portalJsLib = require('/lib/jslibraries/portal');
var view = resolve('js-libraries-portal.html');

function handleGet() {
    var pageUrlResult = portalJsLib.pageUrl();

    var params = {
        assetUrlResultDefault: portalJsLib.assetUrl(),
        assetUrlResultContent: portalJsLib.assetUrl(true),
        assetUrlResultRoot: portalJsLib.assetUrl(false),
        attachmentUrlResultDefault: portalJsLib.attachmentUrl(),
        attachmentUrlResultContent: portalJsLib.attachmentUrl(true),
        attachmentUrlResultRoot: portalJsLib.attachmentUrl(false),
        componentUrlResultDefault: portalJsLib.componentUrl(),
        componentUrlResultContent: portalJsLib.componentUrl(true),
        componentUrlResultRoot: portalJsLib.componentUrl(false),
        imageUrlResultDefault: portalJsLib.imageUrl(),
        imageUrlResultContent: portalJsLib.imageUrl(true),
        imageUrlResultRoot: portalJsLib.imageUrl(false),
        pageUrlResultDefault: portalJsLib.pageUrl(),
        pageUrlResultContent: portalJsLib.pageUrl(true),
        pageUrlResultRoot: portalJsLib.pageUrl(false),
        serviceUrlResultDefault: portalJsLib.serviceUrl(),
        serviceUrlResultContent: portalJsLib.serviceUrl(),
        serviceUrlResultRoot: portalJsLib.serviceUrl(false),
        idProviderUrlResultDefault: portal.idProviderUrl(),
        idProviderUrlResultContent: portal.idProviderUrl({contentPath: true}),
        idProviderUrlResultRoot: portal.idProviderUrl({contentPath: false}),
        loginUrlResultDefault: portal.loginUrl({redirect: pageUrlResult}),
        loginUrlResultContent: portal.loginUrl({redirect: pageUrlResult, contentPath: true}),
        loginUrlResultRoot: portal.loginUrl({redirect: pageUrlResult, contentPath: false}),
        logoutUrlResultDefault: portal.logoutUrl({redirect: pageUrlResult}),
        logoutUrlResultContent: portal.logoutUrl({redirect: pageUrlResult, contentPath: true}),
        logoutUrlResultRoot: portal.logoutUrl({redirect: pageUrlResult, contentPath: false}),
        processHtmlResult: JSON.stringify(portalJsLib.processHtml(), null, 4),
        getUserStoreKeyResult: portal.getUserStoreKey(),
        imagePlaceholder: portal.imagePlaceholder({width: 64,height: 32})
    };

    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

exports.get = handleGet;