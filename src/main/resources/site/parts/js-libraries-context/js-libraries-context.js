var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');
var contextJsLib = require('/lib/jslibraries/context');
var view = resolve('js-libraries-context.html');

function handleGet(req) {

    var runWithUserResult = JSON.stringify(contextJsLib.runWithUser(), null, 4);
    var runWithPrincipalsResult = JSON.stringify(contextJsLib.runWithPrincipals(), null, 4);
    var runWithBranchResult = JSON.stringify(contextJsLib.runWithBranch(), null, 4);

    var params = {
        runWithUserResult: runWithUserResult,
        runWithPrincipalsResult: runWithPrincipalsResult,
        runWithBranchResult: runWithBranchResult
    };

    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

exports.get = handleGet;