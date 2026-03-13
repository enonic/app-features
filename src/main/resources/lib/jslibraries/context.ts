import * as contextLib from '/lib/xp/context';

export function getContext() {
    const result = contextLib.get();
    log.info('GetContext result: ' + JSON.stringify(result, null, 4));
    return result;
}

export function getContextAsAnonymous() {
    const result = contextLib.run({
        user: {
            login: 'anonymous',
            idProvider: 'system'
        }
    }, contextLib.get);
    log.info('GetContext as anonymous result: ' + JSON.stringify(result, null, 4));
    return result;
}

export function getContextWithAdditionalRole() {
    const result = contextLib.run({
        principals: ["role:system.myrole"]
    }, contextLib.get);
    log.info('GetContext with additional role result: ' + JSON.stringify(result, null, 4));
    return result;
}

export function getContextWithMasterBranch() {
    const result = contextLib.run({
        branch: 'master'
    }, contextLib.get);
    log.info('GetContext on master branch result: ' + JSON.stringify(result, null, 4));
    return result;
}

export function getContextWithSystemRepository() {
    const result = contextLib.run({
        repository: 'system'
    }, contextLib.get);
    log.info('GetContext on system repository result: ' + JSON.stringify(result, null, 4));
    return result;
}
