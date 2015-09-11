var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');
var auth = require('/lib/xp/auth');


exports.get = function (req) {
    var user = auth.getUser();
    var postUrl = portal.componentUrl({});

    var params = {
        postUrl: postUrl,
        user: user,
        userStore: 'system'
    };

    var view = resolve('auth.html');
    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body,
        pageContributions: {
            headEnd: [
                '<link rel="stylesheet" href="' + portal.assetUrl({path: 'css/parts/auth/auth.css'}) + '" type="text/css" />',
            ],
            bodyEnd: [
                '<script src="' + portal.assetUrl({path: 'js/jquery-2.1.4.min.js'}) + '" type="text/javascript"></script>',
                '<script src="' + portal.assetUrl({path: 'js/parts/auth/auth.js'}) + '" type="text/javascript"></script>',
            ]
        }
    };
};

exports.post = function (req) {
    var action = req.formParams.action;
    var userName = req.formParams.user;
    var pwd = req.formParams.pwd;
    var userStore = req.formParams.userStore;

    var user;
    if (action === 'logout') {
        auth.logout();
        user = auth.getUser();

    } else if (action === 'login') {
        var loginResult = auth.login({
            user: userName,
            password: pwd,
            userStore: userStore
        });

        if (loginResult.authenticated) {
            user = loginResult.user;
        }
        log.info('LOGIN %s', loginResult);

     } else {
        user = auth.getUser();
    }

    var postUrl = portal.componentUrl({});

    var params = {
        postUrl: postUrl,
        user: user,
        userStore: userStore || 'system'
    };

    var view = resolve('auth.html');
    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
};