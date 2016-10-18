var repoLib = require('/lib/xp/repo.js');

exports.create = function (id, light) {

    var repo = repoLib.get({
        id: id
    });

    if (repo) {
        log.info('Repository [' + id + '] already exists');
        return 'Repository [' + id + '] already exists';
    } else {
        var result = repoLib.create({
            id: id,
            settings: {
                validationSettings: light ? {
                    checkExists: false,
                    checkParentExists: false,
                    checkPermissions: false
                } : undefined
            }
        });

        log.info('Repository [' + result.id + '] was created');
        return result;
    }

};

exports.get = function (id) {
    var result = repoLib.get({
        id: id
    });

    return result;
};