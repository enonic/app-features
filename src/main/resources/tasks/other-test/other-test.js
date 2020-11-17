var auth = require('/lib/xp/auth');

exports.run = function (params) {
    var user = auth.getUser();

    log.info( JSON.stringify(user) + ' Executing task "other-test": ' + JSON.stringify(params));
};
