var portal = require('/lib/xp/portal');
var auth = require('/lib/xp/auth');
var thymeleaf = require('/lib/thymeleaf');


exports.get = function (req) {
    var user = auth.getUser();
    var postUrl = portal.componentUrl({});

    var params = {
        postUrl: postUrl,
        // principalKey: user ? user.key : '',
        type: 'any'
    };

    var view = resolve('memberships.html');
    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body,
        pageContributions: {
            headEnd: [
                '<link rel="stylesheet" href="' + portal.assetUrl({path: 'css/parts/memberships/memberships.css'}) + '" type="text/css" />',
            ],
            bodyEnd: [
                '<script src="' + portal.assetUrl({path: 'js/jquery-2.1.4.min.js'}) + '" type="text/javascript"></script>',
                '<script src="' + portal.assetUrl({path: 'js/parts/memberships/memberships.js'}) + '" type="text/javascript"></script>',
            ]
        }
    };
};

exports.post = function (req) {
    var action = req.params.action;
    var key = req.params.key || '';
    var removeParam = req.params.remove || '';
    var removeKeys = removeParam.trim() ? removeParam.split(',') : [];
    var addKey = req.params.add || '';
    var username = req.params.username || '';
    var displayname = req.params.displayname || '';
    var email = req.params.email || '';
    var idProvider = req.params.idProvider || '';
    var searchText = req.params.searchText || '';
    var typeParam = '';
    if (req.params.user === 'true') {
        typeParam = 'user';
    } else if (req.params.group === 'true') {
        typeParam = 'group';
    } else if (req.params.role === 'true') {
        typeParam = 'role';
    }

    var errorMsg, infoMsg;
    var principal, memberships, members, type, results;
    if (action === 'search') {
        if (key) {
            try {
                principal = auth.getPrincipal(key);
            } catch (e) {
                //
            }
        } else {
            results = auth.findPrincipals({
                type: typeParam,
                idProvider: idProvider,
                start: 0,
                count: 10,
                name: username,
                email: email,
                displayName: displayname,
                searchText: searchText
            });
            infoMsg = results.total + ' principals found.';
            log.info('Results \r\n %s', results);
        }
    }
    if (action === 'remove' && key && removeKeys.length) {
        try {
            principal = auth.getPrincipal(key);
        } catch (e) {
        }

        auth.removeMembers(key, removeKeys);
        infoMsg = 'Members removed';
    }
    if (action === 'add' && key && addKey) {
        try {
            principal = auth.getPrincipal(key);
        } catch (e) {
        }

        log.info('%s %s', key, addKey);
        auth.addMembers(key, [addKey]);
        infoMsg = 'Member ' + addKey + ' added to ' + key;
    }

    if (principal) {
        type = principal.type;
        if (type !== 'user') {
            members = auth.getMembers(key);
            log.info('Members %s', members);
        }
        memberships = auth.getMemberships(key);
        log.info('Memberships %s', memberships);

    } else if (!results) {
        errorMsg = 'Principal not found';
    }

    var postUrl = portal.componentUrl({});

    var params = {
        postUrl: postUrl,
        user: type === 'user' ? principal : null,
        group: type === 'group' || type === 'role' ? principal : null,
        principalKey: key,
        username: username,
        displayname: displayname,
        email: email,
        idProvider: idProvider,
        searchText: searchText,
        type: typeParam || 'any',
        memberships: memberships,
        members: members,
        searchResults: results ? results.hits : null,
        errorMsg: errorMsg,
        infoMsg: infoMsg
    };

    var view = resolve('memberships.html');
    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
};