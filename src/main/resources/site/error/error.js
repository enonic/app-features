var thymeleaf = require('/lib/xp/thymeleaf');

var view404 = resolve('404.html');
var viewGeneric = resolve('default.html');

exports.handle404 = function (err) {
    var debugMode = err.request.params.debug === 'true';
    if (debugMode && (err.request.mode === 'preview' || err.request.mode === 'edit')) {
        return null;
    }

    var params = {};
    var body = thymeleaf.render(view404, params);

    return {
        contentType: 'text/html',
        body: body
    }
};

exports.handleError = function (err) {
    var debugMode = err.request.params.debug === 'true';
    if (debugMode && (err.request.mode === 'preview' || err.request.mode === 'edit')) {
        return null;
    }

    var params = {
        errorCode: err.status
    };
    var body = thymeleaf.render(viewGeneric, params);

    return {
        contentType: 'text/html',
        body: body
    }
};
