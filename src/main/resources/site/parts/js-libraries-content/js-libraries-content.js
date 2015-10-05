var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');
var contentJsLib = require('/lib/jslibraries/content');
var view = resolve('js-libraries-content.html');

function handleGet(req) {

    var createResult = JSON.stringify(contentJsLib.create(), null, 4);
    var getResult = JSON.stringify(contentJsLib.get(), null, 4);
    var getChildrenResult = JSON.stringify(contentJsLib.getChildren(), null, 4);
    var queryResult = JSON.stringify(contentJsLib.query(), null, 4);
    var modifyResult = JSON.stringify(contentJsLib.modify(), null, 4);
    var deleteResult = JSON.stringify(contentJsLib.delete(), null, 4);

    var params = {
        createResult: createResult,
        getResult: getResult,
        getChildrenResult: getChildrenResult,
        queryResult: queryResult,
        modifyResult: modifyResult,
        deleteResult: deleteResult
    };

    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

exports.get = handleGet;