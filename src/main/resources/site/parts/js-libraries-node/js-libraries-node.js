var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');
var nodeJsLib = require('/lib/jslibraries/node');
var view = resolve('js-libraries-node.html');
var contentLib = require('/lib/xp/content');
var contextLib = require('/lib/xp/context');

function handleGet(req) {

    //var createResult = JSON.stringify(nodeJsLib.create(), null, 4);
    var getNodeByKeyResult = JSON.stringify(nodeJsLib.getNodeByKeyResult(), null, 4);
    var getMissingNodeByKeyResult = JSON.stringify(nodeJsLib.getMissingNodeByKeyResult(), null, 4);
    var getNodesByKeysResult = JSON.stringify(nodeJsLib.getNodesByKeysResult(), null, 4);

    var params = {
        //createResult: createResult,
        getNodeByKeyResult: getNodeByKeyResult,
        getMissingNodeByKeyResult: getMissingNodeByKeyResult,
        getNodesByKeysResult: getNodesByKeysResult

    };

    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

exports.get = handleGet;