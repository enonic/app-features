var content = require('/lib/xp/content');
var thymeleaf = require('/lib/xp/thymeleaf');
var auth = require('/lib/xp/auth');
var context = require('/lib/xp/context');
var view = resolve('security.html');

function handleGet(req) {

    var getUserResult = auth.getUser();
    var getUserResultWithContext = context.runWith({
        user: 'su'
    }, auth.getUser);


    function getNumberOfContents() {
        return {
            total: content.query({count: 0}).total
        }
    }

    var getNumberOfContentsResult = getNumberOfContents();
    var getNumberOfContentsOnMasterResult = context.runWith({
        branch: 'master'
    }, getNumberOfContents);

    var params = {
        getUserResult: getUserResult,
        getUserResultWithContext: getUserResultWithContext,
        getNumberOfContentsResult: getNumberOfContentsResult,
        getNumberOfContentsOnMasterResult: getNumberOfContentsOnMasterResult
    };

    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

exports.get = handleGet;