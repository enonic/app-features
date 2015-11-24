var content = require('/lib/xp/content');
var thymeleaf = require('/lib/xp/thymeleaf');
var auth = require('/lib/xp/auth');
var context = require('/lib/xp/context');
var view = resolve('security.html');

function a() {
    return JSON.stringify(auth.getUser(), null, 4);
}


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


    var updatedContent = content.setPermissions({
        key: '03c6ae7b-7f48-45f5-973d-1f03606ab928',
        permissions: [{
            principal: 'user:system:anonymous',
            allow: ['READ'],
            deny: []
        }]
    });

    var params = {
        getUserResult: getUserResult,
        getUserResultWithContext: getUserResultWithContext,
        getNumberOfContentsResult: getNumberOfContentsResult,
        getNumberOfContentsOnMasterResult: getNumberOfContentsOnMasterResult,
        updatedContent: updatedContent
    };

    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

exports.get = handleGet;