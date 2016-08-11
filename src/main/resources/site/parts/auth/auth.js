var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');
var auth = require('/lib/xp/auth');


exports.get = function (req) {
    var user = auth.getUser();
    var postUrl = portal.componentUrl({});

    var profile = getProfile(user && user.key, app.name);

    var params = {
        postUrl: postUrl,
        user: user,
        userStore: 'system',
        role: 'system.admin',
        scope: app.name,
        profile: JSON.stringify(profile, null, 2)
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
    var scope = req.params.scope;
    var profile = req.params.profile || '';
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
    } else if (action === 'getProfile') {
        profile = getProfile(userKey, scope == '' ? null : scope);
    } else if (action === 'modifyProfile') {
        profile = modifyProfile(userKey, scope == '' ? null : scope, function (c) {
            var newProfile = JSON.parse(profile);
            log.info('UserExtraData before: %s', JSON.stringify(c));
            log.info('UserExtraData after:  %s', JSON.stringify(newProfile));
            return newProfile;
        });
    } else {
        profile = getProfile(user && user.key, app.name);
    }

    var postUrl = portal.componentUrl({});

    var params = {
        postUrl: postUrl,
        user: user,
        userStore: userStore,
        role: role,
        hasRole: hasRole,
        errorMsg: errorMsg,
        scope: scope,
        profile: JSON.stringify(profile, null, 2)
    };

    var view = resolve('auth.html');
    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
};

function getProfile(userKey, scope) {
    if (userKey) {
        return auth.getProfile({
            key: userKey,
            scope: scope
        });
    }
    return null;
}
function modifyProfile(userKey, scope, editor) {
    if (userKey) {
        return auth.modifyProfile({
            key: userKey,
            scope: scope,
            editor: editor
        });
    }
    return null;
}