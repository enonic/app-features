var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');
var contentJsLib = require('/lib/jslibraries/content');
var view = resolve('js-libraries-content.html');

function handleGet(req) {

    var createResult = JSON.stringify(contentJsLib.create(), null, 4);
    var getResult = JSON.stringify(contentJsLib.get(), null, 4);
    var getChildrenResult = JSON.stringify(contentJsLib.getChildren(), null, 4);
    var queryResult = JSON.stringify(contentJsLib.query(), null, 4);
    var publishResult = JSON.stringify(contentJsLib.publish(), null, 4);
    var modifyResult = JSON.stringify(contentJsLib.modify(), null, 4);
    var findVersionsResult = JSON.stringify(contentJsLib.findVersions(), null, 4);
    var getActiveVersionsResult = JSON.stringify(contentJsLib.getActiveVersions(), null, 4);
    var getPermissionsResultBefore = JSON.stringify(contentJsLib.getPermissions(), null, 4);
    var setPermissionsResult = JSON.stringify(contentJsLib.setPermissions(), null, 4);
    var getPermissionsResultAfter = JSON.stringify(contentJsLib.getPermissions(), null, 4);
    var deleteResult = JSON.stringify(contentJsLib.delete(), null, 4);
    var publishResult2 = JSON.stringify(contentJsLib.publish(), null, 4);

    var params = {
        createResult: createResult,
        getResult: getResult,
        getChildrenResult: getChildrenResult,
        publishResult: publishResult,
        queryResult: queryResult,
        modifyResult: modifyResult,
        findVersionsResult: findVersionsResult,
        getActiveVersionsResult: getActiveVersionsResult,
        getPermissionsResultBefore: getPermissionsResultBefore,
        setPermissionsResult: setPermissionsResult,
        getPermissionsResultAfter: getPermissionsResultAfter,
        deleteResult: deleteResult,
        publishResult2: publishResult2
    };

    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

exports.get = handleGet;