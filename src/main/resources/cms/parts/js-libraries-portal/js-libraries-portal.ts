import * as portal from '/lib/xp/portal';
import * as thymeleaf from '/lib/thymeleaf';
import * as portalJsLib from '/lib/jslibraries/portal';

const view = resolve('js-libraries-portal.html');

function handleGet() {
    const pageUrlResult = portalJsLib.pageUrl();

    const params = {
        assetUrlResult: portalJsLib.assetUrl(),
        attachmentUrlResult: portalJsLib.attachmentUrl(),
        componentUrlResult: portalJsLib.componentUrl(),
        imageUrlResult: portalJsLib.imageUrl(),
        pageUrlResult: pageUrlResult,
        serviceUrlResult: portalJsLib.serviceUrl(),
        idProviderUrlResult: portal.idProviderUrl(),
        loginUrlResult: portal.loginUrl({redirect: pageUrlResult}),
        logoutUrlResult: portal.logoutUrl({redirect: pageUrlResult}),
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

export {handleGet as GET};
