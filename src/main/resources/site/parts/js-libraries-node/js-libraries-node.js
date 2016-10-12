var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');
var nodeJsLib = require('/lib/jslibraries/node');
var view = resolve('js-libraries-node.html');
var contentLib = require('/lib/xp/content');
var contextLib = require('/lib/xp/context');

function handleGet(req) {

    //var createResult = JSON.stringify(nodeJsLib.create(), null, 4);
    var getResult = JSON.stringify(nodeJsLib.get(), null, 4);

    var params = {
        //createResult: createResult,
        getResult: getResult
    };

    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

exports.get = handleGet;