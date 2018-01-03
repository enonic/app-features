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
        attachmentUrlResult: portalJsLib.attachmentUrl(),
        componentUrlResult: portalJsLib.componentUrl(),
        imageUrlResultDefault: portalJsLib.imageUrl(),
        imageUrlResultContent: portalJsLib.imageUrl(true),
        imageUrlResultRoot: portalJsLib.imageUrl(false),
        pageUrlResult: portalJsLib.pageUrl(),
        serviceUrlResultDefault: portalJsLib.serviceUrl(),
        serviceUrlResultContent: portalJsLib.serviceUrl(true),
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
        applicationUrlMinResult: portalJsLib.applicationUrl(),
        applicationUrlMaxResult: portalJsLib.applicationUrl({
            application: 'com.enonic.app.superhero',
            path: '/subpath',
            params: {
                a: 1,
                b: [2, "3"]
            }
        }),
        processHtmlResult: JSON.stringify(portalJsLib.processHtml(), null, 4),
        getUserStoreKeyResult: portal.getUserStoreKey(),
        imagePlaceholder: portal.imagePlaceholder({width: 64, height: 32})
    };

    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

exports.get = handleGet;