var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/thymeleaf');
var auth = require('/lib/xp/auth');


exports.get = function (req) {
    var user = auth.getUser();
    var postUrl = portal.componentUrl({});
    var directMemberships = getMemberships(user && user.key);
    var transitiveMemberships = getMemberships(user && user.key, true);
    var profile = getProfile(user && user.key);

    var params = {
        postUrl: postUrl,
        user: user,
        directMemberships: directMemberships,
        transitiveMemberships: transitiveMemberships,
        idProvider: 'system',
        role: 'system.admin',
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
    var idProvider = req.params.idProvider || 'system';
    var role = req.params.role || '';
    var userKey = req.params.userKey || '';
    var scope = req.params.scope || '';
    var hasRole, errorMsg, findUsersResult, findPrincipalsResult;

    var user = auth.getUser();
    var directMemberships = getMemberships(user && user.key);
    var transitiveMemberships = getMemberships(user && user.key, true);
    var profile = getProfile(userKey, scope == '' ? null : scope);
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
            idProvider: idProvider
        });

        if (loginResult.authenticated) {
            user = loginResult.user;
        }
        errorMsg = loginResult.message;
        log.info('LOGIN %s', loginResult);
    } else if (action === 'modifyProfile') {
        profile = modifyProfile(userKey, scope == '' ? null : scope, function (c) {
            var newProfile = JSON.parse(req.params.profile);
            return newProfile;
        });
    } else if (action === 'findPrincipals') {
        findPrincipalsResult = auth.findPrincipals({
            type: req.params.type == '' ? null : req.params.type,
            idProvider: req.params.idProvider == '' ? null : req.params.idProvider,
            start: req.params.start == '' ? null : req.params.start,
            count: req.params.count == '' ? null : req.params.count,
            name: req.params.name == '' ? null : req.params.name,
            searchText: req.params.searchText == '' ? null : req.params.searchText
        });
    } else if (action === 'findUsers') {
        findUsersResult = auth.findUsers({
            start: req.params.start == '' ? null : req.params.start,
            count: req.params.count == '' ? null : req.params.count,
            query: req.params.query == '' ? null : req.params.query,
            sort: req.params.sort == '' ? null : req.params.sort,
            includeProfile: req.params.includeProfile == "true"
        });
    }

    var postUrl = portal.componentUrl({});

    var params = {
        postUrl: postUrl,
        user: user,
        directMemberships: directMemberships,
        transitiveMemberships: transitiveMemberships,
        idProvider: idProvider,
        role: role,
        hasRole: hasRole,
        errorMsg: errorMsg,
        scope: scope,
        profile: JSON.stringify(profile, null, 2),
        start: req.params.start,
        count: req.params.count,
        query: req.params.query,
        sort: req.params.sort,
        includeParams: req.params.includeProfile == "true",
        type: req.params.type,
        name: req.params.name,
        searchText: req.params.searchText,
        findUsersResult: findUsersResult ? JSON.stringify(findUsersResult, null, 2) : '',
        findPrincipalsResult: findPrincipalsResult ? JSON.stringify(findPrincipalsResult, null, 2) : '',
    };

    var view = resolve('auth.html');
    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
};

function getMemberships(userKey, transitive) {
    if (userKey) {
        return auth.getMemberships(userKey, transitive).map(function(membership) {
            return membership.key;
        })
        
    }
    return null;
}

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