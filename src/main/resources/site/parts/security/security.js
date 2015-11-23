var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');
var auth = require('/lib/xp/auth');
var security = require('/lib/xp/security');
var view = resolve('security.html');

function a() {
    return JSON.stringify(auth.getUser(), null, 4);
}


function handleGet(req) {

    var getCurrentUser = function test() {
        log.info("success");
        log.info(JSON.stringify(auth.getUser(), null, 4));
    }


    var getUserResult = getCurrentUser();
    log.info("getUserResult %s", getUserResult);
    var getUserResultWithContext = security.runWith({
        branch: 'draft',
        user: 'su'
    }, getCurrentUser);
    log.info("getUserResultWithContext %s", getUserResultWithContext);


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