var contextLib = require('/lib/xp/context');

exports.getContext = function () {
    var result = contextLib.get();
    log.info('GetContext result: ' + JSON.stringify(result, null, 4));
    return result;
};

exports.getContextAsAnonymous = function () {

    var result = contextLib.run({
        user: {
            login: 'anonymous',
            idProvider: 'system'
        }
    }, contextLib.get);
    log.info('GetContext as anonymous result: ' + JSON.stringify(result, null, 4));
    return result;
};

exports.getContextWithAdditionalRole = function () {

    var result = contextLib.run({
        principals: ["role:system.myrole"]
    }, contextLib.get);
    log.info('GetContext with additional role result: ' + JSON.stringify(result, null, 4));
    return result;
};

exports.getContextWithMasterBranch = function () {

    var result = contextLib.run({
        branch: 'master'
    }, contextLib.get);
    log.info('GetContext on master branch result: ' + JSON.stringify(result, null, 4));
    return result;
};

exports.getContextWithSystemRepository = function () {

    var result = contextLib.run({
        repository: 'system'
    }, contextLib.get);
    log.info('GetContext on system repository result: ' + JSON.stringify(result, null, 4));
    return result;
};