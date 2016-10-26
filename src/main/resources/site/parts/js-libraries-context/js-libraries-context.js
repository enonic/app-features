var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');
var contextJsLib = require('/lib/jslibraries/context');
var view = resolve('js-libraries-context.html');

function handleGet(req) {

    var getContextResult = JSON.stringify(contextJsLib.getContext(), null, 4);
    var getContextAsAnonymousResult = JSON.stringify(contextJsLib.getContextAsAnonymous(), null, 4);
    var getContextWithAdditionalRoleResult = JSON.stringify(contextJsLib.getContextWithAdditionalRole(), null, 4);
    var getContextWithMasterBranchResult = JSON.stringify(contextJsLib.getContextWithMasterBranch(), null, 4);
    var getContextWithSystemRepositoryResult = JSON.stringify(contextJsLib.getContextWithSystemRepository(), null, 4);

    var params = {
        getContextResult: getContextResult,
        getContextAsAnonymousResult: getContextAsAnonymousResult,
        getContextWithAdditionalRoleResult: getContextWithAdditionalRoleResult,
        getContextWithMasterBranchResult: getContextWithMasterBranchResult,
        getContextWithSystemRepositoryResult: getContextWithSystemRepositoryResult
    };

    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

exports.get = handleGet;