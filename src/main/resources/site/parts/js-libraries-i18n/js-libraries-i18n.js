var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/thymeleaf');
var i18nJsLib = require('/lib/jslibraries/i18n');
var view = resolve('js-libraries-i18n.html');

function handleGet(req) {

    // var localizeResult = JSON.stringify(i18nJsLib.localize(), null, 4);
    //
    // var params = {
    //     localizeResult: localizeResult
    // };

    var params = i18nJsLib.localize();

    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

exports.get = handleGet;