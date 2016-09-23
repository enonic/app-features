var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');
var repoJsLib = require('/lib/jslibraries/repo');
var view = resolve('js-libraries-repo.html');
var contentLib = require('/lib/xp/content');
var contextLib = require('/lib/xp/context');

function handleGet(req) {

    var createResult = JSON.stringify(repoJsLib.create(), null, 4);
    var getResult = JSON.stringify(repoJsLib.get(), null, 4);

    var params = {
        createResult: createResult,
        getResult: getResult
    };

    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

exports.get = handleGet;