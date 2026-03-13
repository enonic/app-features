import * as portal from '/lib/xp/portal';
import * as auth from '/lib/xp/auth';
const thymeleaf = require('/lib/thymeleaf') as any;

export const get = function(req: any) {
    const user = auth.getUser();
    const postUrl = portal.componentUrl({});

    const params = {
        postUrl: postUrl,
        type: 'any'
    };

    const view = resolve('memberships.html');
    const body = thymeleaf.render(view, params);

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

export const post = function(req: any) {
    const action = req.params.action;
    const key = req.params.key || '';
    const removeParam = req.params.remove || '';
    const removeKeys = removeParam.trim() ? removeParam.split(',') : [];
    const addKey = req.params.add || '';
    const username = req.params.username || '';
    const displayname = req.params.displayname || '';
    const email = req.params.email || '';
    const idProvider = req.params.idProvider || '';
    const searchText = req.params.searchText || '';
    let typeParam = '';
    if (req.params.user === 'true') {
        typeParam = 'user';
    } else if (req.params.group === 'true') {
        typeParam = 'group';
    } else if (req.params.role === 'true') {
        typeParam = 'role';
    }

    let errorMsg: any, infoMsg: any;
    let principal: any, memberships: any, members: any, type: any, results: any;
    if (action === 'search') {
        if (key) {
            try {
                principal = auth.getPrincipal(key);
            } catch (e) {
                //
            }
        } else {
            results = auth.findPrincipals({
                type: typeParam as any,
                idProvider: idProvider,
                start: 0,
                count: 10,
                name: username,
                displayName: displayname,
                searchText: searchText
            } as any);
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

    const postUrl = portal.componentUrl({});

    const params = {
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

    const view = resolve('memberships.html');
    const body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
};
