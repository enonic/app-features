var repoLib = require('/lib/xp/repo.js');

exports.create = function () {

    var repo = repoLib.get({
        id: 'test-repo'
    });

    if (repo) {
        log.info('Repository [test-repo] already exists');
        return 'Repository [test-repo] already exists';
    } else {
        var result = repoLib.create({
            id: 'test-repo',
            validation: {
                checkExists: false,
                checkParentExists: false
            }
        });

        log.info('Repository [' + result.id + '] was created');
        return result;
    }

};

exports.get = function () {
    var result = repoLib.get({
        id: 'test-repo'
    });

    return result;
};