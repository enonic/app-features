var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');
var repoJsLib = require('/lib/jslibraries/repo');
var view = resolve('js-libraries-repo.html');

function handleGet(req) {
    var createFeaturesRepoResult = JSON.stringify(repoJsLib.create('features-repo'), null, 4);
    var getFeaturesRepoResult = JSON.stringify(repoJsLib.get('features-repo'), null, 4);

    var createBranchResult;
    try {
        createBranchResult = JSON.stringify(repoJsLib.createBranch('features-branch'), null, 4);
    } catch (e) {
        if (e.code == 'branchAlreadyExists') {
            log.error('Branch [features-branch] already exist');
            createBranchResult = "Branch [features-branch] already exist";
        } else {
            log.error('Unexpected error: ' + e.message);
            createBranchResult = e.message;
        }
    }
    var listReposResult = JSON.stringify(repoJsLib.list(), null, 4);

    var params = {
        createFeaturesRepoResult: createFeaturesRepoResult,
        getFeaturesRepoResult: getFeaturesRepoResult,
        createBranchResult: createBranchResult,
        listReposResult: listReposResult
    };

    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

exports.get = handleGet;