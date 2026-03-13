import * as portal from '/lib/xp/portal';
const thymeleaf = require('/lib/thymeleaf') as any;
import * as portalJsLib from '/lib/jslibraries/portal';

const view = resolve('js-libraries-portal.html');

function handleGet() {
    const pageUrlResult = portalJsLib.pageUrl();

    const params = {
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
        idProviderUrlResultContent: portal.idProviderUrl({contextPath: 'relative'} as any),
        idProviderUrlResultRoot: portal.idProviderUrl({contextPath: 'vhost'} as any),
        loginUrlResultDefault: portal.loginUrl({redirect: pageUrlResult}),
        loginUrlResultContent: portal.loginUrl({redirect: pageUrlResult, contextPath: 'relative'} as any),
        loginUrlResultRoot: portal.loginUrl({redirect: pageUrlResult, contextPath: 'vhost'} as any),
        logoutUrlResultDefault: portal.logoutUrl({redirect: pageUrlResult}),
        logoutUrlResultContent: portal.logoutUrl({redirect: pageUrlResult, contextPath: 'relative'} as any),
        logoutUrlResultRoot: portal.logoutUrl({redirect: pageUrlResult, contextPath: 'vhost'} as any),
        processHtmlResult: JSON.stringify(portalJsLib.processHtml(), null, 4),
        getIdProviderKeyResult: portal.getIdProviderKey(),
        imagePlaceholder: portal.imagePlaceholder({width: 64, height: 32})
    };

    const body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

export { handleGet as get };
