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
            validation: light ? undefined : {
                checkExists: false,
                checkParentExists: false
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