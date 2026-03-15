import * as portal from '/lib/xp/portal';
import * as thymeleaf from '/lib/thymeleaf';
import * as auth from '/lib/xp/auth';
import type {Request} from '@enonic-types/core';

export const GET = function (req: Request) {
    const user = auth.getUser();
    const postUrl = portal.componentUrl({});
    const directMemberships = getMemberships(user && user.key);
    const transitiveMemberships = getMemberships(user && user.key, true);
    const profile = getProfile(user && user.key);

    const params = {
        postUrl: postUrl,
        user: user,
        directMemberships: directMemberships,
        transitiveMemberships: transitiveMemberships,
        idProvider: 'system',
        role: 'system.admin',
        profile: JSON.stringify(profile, null, 2)
    };

    const view = resolve('auth.html');
    const body = thymeleaf.render(view, params);

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

export const POST = function (req: Request) {
    const action = req.params.action as string;
    const userName = req.params.user as string || '';
    const pwd = req.params.pwd as string || '';
    const idProvider = req.params.idProvider as string || 'system';
    const role = req.params.role as string || '';
    const userKey = req.params.userKey as string || '';
    const scope = req.params.scope as string || '';
    let hasRole: any, errorMsg: any, findUsersResult: any, findPrincipalsResult: any;

    let user: any = auth.getUser();
    let directMemberships: any = getMemberships(user && user.key);
    let transitiveMemberships: any = getMemberships(user && user.key, true);
    let profile: any = getProfile(userKey, scope == '' ? null : scope);

    if (action === 'logout') {
        auth.logout();
        user = auth.getUser();

    } else if (action === 'hasRole') {
        hasRole = auth.hasRole(role);
        log.info('Current user has role %s? %s', role, hasRole ? 'Yes' : 'No');

    } else if (action === 'login') {
        const loginResult = auth.login({
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
        profile = modifyProfile(userKey, scope == '' ? null : scope, function (c: any) {
            const newProfile = JSON.parse(req.params.profile as string);
            return newProfile;
        });
    } else if (action === 'findPrincipals') {
        findPrincipalsResult = auth.findPrincipals({
            type: req.params.type == '' ? null : req.params.type,
            idProvider: req.params.idProvider == '' ? null : requireSingleString(req.params, 'idProvider'),
            start: req.params.start == '' ? null : parseInt(requireSingleString(req.params, 'start')),
            count: req.params.count == '' ? null : parseInt(requireSingleString(req.params, 'count')),
            name: req.params.name == '' ? null : requireSingleString(req.params, 'name'),
            searchText: req.params.searchText == '' ? null : requireSingleString(req.params, 'searchText')
        } as any);
    } else if (action === 'findUsers') {
        findUsersResult = (auth).findUsers({
            start: req.params.start == '' ? null : parseInt(requireSingleString(req.params, 'start')),
            count: req.params.count == '' ? null : parseInt(requireSingleString(req.params, 'count')),
            query: req.params.query == '' ? null : requireSingleString(req.params, 'query'),
            sort: req.params.sort == '' ? null : requireSingleString(req.params, 'sort'),
            includeProfile: req.params.includeProfile == "true"
        } as any);
    }

    const postUrl = portal.componentUrl({});

    const params = {
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

    const view = resolve('auth.html');
    const body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
};

function getMemberships(userKey: any, transitive?: any) {
    if (userKey) {
        return auth.getMemberships(userKey, transitive).map(function (membership: any) {
            return membership.key;
        });
    }
    return null;
}

function getProfile(userKey: any, scope?: any) {
    if (userKey) {
        return auth.getProfile({
            key: userKey,
            scope: scope
        });
    }
    return null;
}

function modifyProfile(userKey: any, scope: any, editor: any) {
    if (userKey) {
        return auth.modifyProfile({
            key: userKey,
            scope: scope,
            editor: editor
        });
    }
    return null;
}

function requireSingleString<
    T extends Record<string, string | string[] | undefined>,
    K extends keyof T
>(obj: T, key: K): string {
    const value = obj[key];

    if (typeof value === "string") {
        return value;
    }

    throw new Error(`${String(key)} must be a single string`);
}