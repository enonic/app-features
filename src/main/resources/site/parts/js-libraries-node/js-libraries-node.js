var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');
var nodeJsLib = require('/lib/jslibraries/node');
var view = resolve('js-libraries-node.html');

function handleGet(req) {

    var createResult = JSON.stringify(nodeJsLib.create(), null, 4);
    var getNodeByKeyResult = JSON.stringify(nodeJsLib.getNodeByKey(), null, 4);
    var getMissingNodeByKeyResult = JSON.stringify(nodeJsLib.getMissingNodeByKey(), null, 4);
    var getNodesByKeysResult = JSON.stringify(nodeJsLib.getNodesByKeys(), null, 4);
    var renameResult = JSON.stringify(nodeJsLib.rename(), null, 4);
    var moveResult = JSON.stringify(nodeJsLib.move(), null, 4);
    var moveAndRenameResult = JSON.stringify(nodeJsLib.moveAndRename(), null, 4);
    var deleteResult = JSON.stringify(nodeJsLib.delete(), null, 4);

    var params = {
        createResult: createResult,
        getNodeByKeyResult: getNodeByKeyResult,
        getMissingNodeByKeyResult: getMissingNodeByKeyResult,
        getNodesByKeysResult: getNodesByKeysResult,
        renameResult: renameResult,
        moveResult: moveResult,
        moveAndRenameResult: moveAndRenameResult,
        deleteResult: deleteResult
    };

    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

exports.get = handleGet;