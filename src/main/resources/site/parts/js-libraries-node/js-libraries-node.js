var thymeleaf = require('/lib/thymeleaf');
var nodeJsLib = require('/lib/jslibraries/node');
var view = resolve('js-libraries-node.html');

function handleGet(req) {

    var createResult = JSON.stringify(nodeJsLib.create(), null, 4);
    var modifyResult = JSON.stringify(nodeJsLib.modify(), null, 4);
    var commitResult = JSON.stringify(nodeJsLib.commit(), null, 4);
    var getNodeByKeyResult = JSON.stringify(nodeJsLib.getNodeByKey(), null, 4);
    var getMissingNodeByKeyResult = JSON.stringify(nodeJsLib.getMissingNodeByKey(), null, 4);
    var getNodesByKeysResult = JSON.stringify(nodeJsLib.getNodesByKeys(), null, 4);
    var existsResult = JSON.stringify(nodeJsLib.exists(), null, 4);
    var existsMissingResult = JSON.stringify(nodeJsLib.existsMissing(), null, 4);
    var renameResult = JSON.stringify(nodeJsLib.rename(), null, 4);
    var moveResult = JSON.stringify(nodeJsLib.move(), null, 4);
    var moveAndRenameResult = JSON.stringify(nodeJsLib.moveAndRename(), null, 4);
    var deleteResult = JSON.stringify(nodeJsLib.delete(), null, 4);
    var diffResult = JSON.stringify(nodeJsLib.diff(), null, 4);
    var pushResult = JSON.stringify(nodeJsLib.push(), null, 4);
    var findChildrenResult = JSON.stringify(nodeJsLib.findChildren(), null, 4);
    var setChildOrderResult = JSON.stringify(nodeJsLib.setChildOrder(), null, 4);
    var queryResult = JSON.stringify(nodeJsLib.query(), null, 4);
    var suggestionsResult = JSON.stringify(nodeJsLib.suggestions(), null, 4);
    var findVersions = JSON.stringify(nodeJsLib.findVersions(), null, 4);
    var setActiveVersion = JSON.stringify(nodeJsLib.setActiveVersion(), null, 4);
    var params = {
        createResult: createResult,
        modifyResult: modifyResult,
        commitResult: commitResult,
        getNodeByKeyResult: getNodeByKeyResult,
        getMissingNodeByKeyResult: getMissingNodeByKeyResult,
        existsResult: existsResult,
        getNodesByKeysResult: getNodesByKeysResult,
        existsMissingResult: existsMissingResult,
        renameResult: renameResult,
        moveResult: moveResult,
        moveAndRenameResult: moveAndRenameResult,
        deleteResult: deleteResult,
        diffResult: diffResult,
        pushResult: pushResult,
        findChildrenResult: findChildrenResult,
        setChildOrderResult: setChildOrderResult,
        queryResult: queryResult,
        suggestionsResult: suggestionsResult,
        findVersions: findVersions,
        setActiveVersion: setActiveVersion
    };

    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

exports.get = handleGet;