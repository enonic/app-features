var repoLib = require('/lib/xp/repo.js');

//TODO Waiting for delete
//exports.create = function () {
//    var result = repoLib.create({
//        id: 'test-repo',
//        validation: {
//            checkExists: false,
//            checkParentExists: false
//        }
//    });
//
//    log.info('Repository created with id ' + result.id);
//    return result;
//};
//
//exports.get = function () {
//    var result = repoLib.get({
//        id: 'test-repo'
//    });
//
//    return result;
//};

exports.get = function () {
    var result = repoLib.get({
        id: 'system-repo'
    });

    return result;
};