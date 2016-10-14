var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');
var repoJsLib = require('/lib/jslibraries/repo');
var view = resolve('js-libraries-repo.html');

function handleGet(req) {
    var createLightRepoResult = JSON.stringify(repoJsLib.create('features-repo-light', true), null, 4);
    var createDefaultRepoResult = JSON.stringify(repoJsLib.create('features-repo-default'), null, 4);
    var getLightRepoResult = JSON.stringify(repoJsLib.get('features-repo-light'), null, 4);
    var getDefaultRepoResult = JSON.stringify(repoJsLib.get('features-repo-default'), null, 4);

    var params = {
        createLightRepoResult: createLightRepoResult,
        createDefaultRepoResult: createDefaultRepoResult,
        getLightRepoResult: getLightRepoResult,
        getDefaultRepoResult: getDefaultRepoResult
    };

    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

exports.get = handleGet;