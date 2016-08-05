var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');
var auth = require('/lib/xp/auth');


exports.get = function (req) {
    var user = auth.getUser();
    var postUrl = portal.componentUrl({});

    var userExtraData = getUserExtraData(user && user.key, app.name);

    var params = {
        postUrl: postUrl,
        user: user,
        userStore: 'system',
        role: 'system.admin',
        appName: app.name,
        userExtraData: JSON.stringify(userExtraData, null, 2)
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
    var action = req.params.action;
    var userName = req.params.user || '';
    var pwd = req.params.pwd || '';
    var userStore = req.params.userStore || 'system';
    var role = req.params.role || '';
    var userKey = req.params.userKey || '';
    var namespace = req.params.namespace || '';
    var userExtraData = req.params.userExtraData || '';
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
    } else if (action === 'getUserExtraData') {
        userExtraData = getUserExtraData(userKey, namespace);
    } else if (action === 'modifyUserExtraData') {
        userExtraData = modifyUserExtraData(userKey, namespace, function (c) {
            var extraData = JSON.parse(userExtraData);
            log.info('UserExtraData before: %s', JSON.stringify(c));
            log.info('UserExtraData after:  %s', JSON.stringify(extraData));
            return extraData;
        });
    } else {
        userExtraData = getUserExtraData(user && user.key, app.name);
    }

    var postUrl = portal.componentUrl({});

    var params = {
        postUrl: postUrl,
        user: user,
        userStore: userStore,
        role: role,
        hasRole: hasRole,
        errorMsg: errorMsg,
        appName: app.name,
        userExtraData: JSON.stringify(userExtraData, null, 2)
    };

    var view = resolve('auth.html');
    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
};

function getUserExtraData(userKey, namespace) {
    if (userKey) {
        return auth.getUserExtraData({
            key: userKey,
            namespace: namespace
        });
    }
    return null;
}
function modifyUserExtraData(userKey, namespace, editor) {
    if (userKey) {
        return auth.modifyUserExtraData({
            key: userKey,
            namespace: namespace,
            editor: editor
        });
    }
    return null;
}