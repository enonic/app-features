var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');
var auth = require('/lib/xp/auth');
var security = require('/lib/xp/security');
var view = resolve('security.html');

function a() {
    return JSON.stringify(auth.getUser(), null, 4);
}


function handleGet(req) {

    function getCurrentUser() {
        log.info("auth.getUser(): %s", JSON.stringify(auth.getUser(), null, 4));
        return auth.getUser();
    }

    var getUserResult = getCurrentUser();
    var getUserResultWithContext = security.runWith({
        branch: 'draft',
        user: 'su'
    }, getCurrentUser);

    var params = {
        getUserResult: getUserResult,
        getUserResultWithContext: getUserResultWithContext
    };

    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

exports.get = handleGet;