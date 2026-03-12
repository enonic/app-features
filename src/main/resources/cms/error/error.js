var thymeleaf = require('/lib/thymeleaf');
const portal = require('/lib/xp/portal');
var view404 = resolve('404.html');
var viewGeneric = resolve('default.html');

exports.handle404 = function (err) {
    var debugMode = err.request.params.debug === 'true';
    if (debugMode && (err.request.mode === 'preview' || err.request.mode === 'edit')) {
        return null;
    }

    var params = {
        cssUrl: portal.assetUrl({path: 'error/css/custom.css'}),
        imgNotFoundUrl: portal.assetUrl({path: 'error/img/no-nick.svg'}),
        siteRootUrl: portal.pageUrl({path: '/features'}),
    };
    var body = thymeleaf.render(view404, params);

    return {
        contentType: 'text/html',
        body: body
    }
};

exports.handleError = function (err) {

    log.error("Error:" + JSON.stringify(err, null, 2));
    var debugMode = err.request.params.debug === 'true';
    if (debugMode && (err.request.mode === 'preview' || err.request.mode === 'edit')) {
        return null;
    }

    var params = {
        errorCode: err.status,
        cssUrl: portal.assetUrl({path: 'error/css/custom.css'}),
        imgErrorUrl: portal.assetUrl({path: 'error/img/nick-hanging-from-cloud.svg'}),
        siteRootUrl: portal.pageUrl({path: '/features'}),
    };
    var body = thymeleaf.render(viewGeneric, params);

    return {
        contentType: 'text/html',
        body: body
    }
};
