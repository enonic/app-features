import * as nodeJsLib from '/lib/jslibraries/node';
import * as thymeleaf from '/lib/thymeleaf';
import type {Request} from '@enonic-types/core';

const view = resolve('js-libraries-node.html');

function handleGet(req: Request) {

    const createResult = JSON.stringify(nodeJsLib.create(), null, 4);
    const modifyResult = JSON.stringify(nodeJsLib.modify(), null, 4);
    const commitResult = JSON.stringify(nodeJsLib.commit(), null, 4);
    const getNodeByKeyResult = JSON.stringify(nodeJsLib.getNodeByKey(), null, 4);
    const getMissingNodeByKeyResult = JSON.stringify(nodeJsLib.getMissingNodeByKey(), null, 4);
    const getNodesByKeysResult = JSON.stringify(nodeJsLib.getNodesByKeys(), null, 4);
    const existsResult = JSON.stringify(nodeJsLib.exists(), null, 4);
    const existsMissingResult = JSON.stringify(nodeJsLib.existsMissing(), null, 4);
    const renameResult = JSON.stringify(nodeJsLib.rename(), null, 4);
    const moveResult = JSON.stringify(nodeJsLib.move(), null, 4);
    const moveAndRenameResult = JSON.stringify(nodeJsLib.moveAndRename(), null, 4);
    const deleteResult = JSON.stringify(nodeJsLib.deleteNodes(), null, 4);
    const diffResult = JSON.stringify(nodeJsLib.diff(), null, 4);
    const pushResult = JSON.stringify(nodeJsLib.push(), null, 4);
    const findChildrenResult = JSON.stringify(nodeJsLib.findChildren(), null, 4);
    const setChildOrderResult = JSON.stringify(nodeJsLib.sort(), null, 4);
    const queryResult = JSON.stringify(nodeJsLib.query(), null, 4);
    const suggestionsResult = JSON.stringify(nodeJsLib.suggestions(), null, 4);
    const highlightResult = JSON.stringify(nodeJsLib.highlight(), null, 4);
    const findVersions = JSON.stringify(nodeJsLib.findVersions(), null, 4);
    const getActiveVersion = JSON.stringify(nodeJsLib.getActiveVersion(), null, 4);
    const getCommit = JSON.stringify(nodeJsLib.getCommit(), null, 4);
    const params = {
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
        highlightResult: highlightResult,
        findVersions: findVersions,
        getActiveVersion: getActiveVersion,
        getCommit: getCommit
    };

    const body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

export {handleGet as GET};
