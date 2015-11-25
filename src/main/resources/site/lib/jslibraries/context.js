exports.runWithUser = function () {

    //Documentation BEGIN
    var authLib = require('/lib/xp/auth');
    var contextLib = require('/lib/xp/context');

    var result = contextLib.run({
        user: 'su'
    }, authLib.getUser);

    if (result) {
        log.info('Current user name: ' + result.displayName);
    } else {
        log.info('No current user');
    }
    //Documentation END

    log.info('RunWithUser result: ' + JSON.stringify(result, null, 4));

    return result;
};

exports.runWithBranch = function () {

    //Documentation BEGIN
    var contentLib = require('/lib/xp/content');
    var contextLib = require('/lib/xp/context');

    function getNumberOfContents() {
        return {
            total: contentLib.query({count: 0}).total
        }
    }

    var result = contextLib.run({
        branch: 'master'
    }, getNumberOfContents);

    if (result) {
        log.info('Number of contents on master: ' + result.total);
    }
    //Documentation END

    log.info('RunWithBranch result: ' + JSON.stringify(result, null, 4));

    return result;
};
