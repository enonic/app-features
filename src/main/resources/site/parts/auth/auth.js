var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');
var auth = require('/lib/xp/auth');


exports.get = function (req) {
    var user = auth.getUser();
    var postUrl = portal.componentUrl({});

    var params = {
        postUrl: postUrl,
        user: user,
        userStore: 'system',
        role: 'system.admin'
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
        },
        filters: ['filter1']
    };
};

exports.post = function (req) {
    var action = req.params.action;
    var userName = req.params.user || '';
    var pwd = req.params.pwd || '';
    var userStore = req.params.userStore || 'system';
    var role = req.params.role || '';
    var hasRole, errorMsg;

    var user = auth.getUser();
    if (action === 'logout') {
        auth.logout();
        user = auth.getUser();

    } else if (action === 'hasRole') {
        hasRole = auth.hasRole(role);
        log.info('Current user has role %s? %s', role, hasRole ? 'Yes' : 'No');

    } else if (action === 'login') {
        var loginResult = auth.login({
            user: userName,
            password: pwd,
            userStore: userStore
        });

        if (loginResult.authenticated) {
            user = loginResult.user;
        }
        errorMsg = loginResult.message;
        log.info('LOGIN %s', loginResult);

    }

    var postUrl = portal.componentUrl({});

    var params = {
        postUrl: postUrl,
        user: user,
        userStore: userStore,
        role: role,
        hasRole: hasRole,
        errorMsg: errorMsg
    };

    var view = resolve('auth.html');
    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body,
        filters: ['filter1']
    };
};