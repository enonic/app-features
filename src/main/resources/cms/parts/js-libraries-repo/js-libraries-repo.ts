import * as portal from '/lib/xp/portal';
const thymeleaf = require('/lib/thymeleaf') as any;
import * as nodeJsLib from '/lib/jslibraries/node';
import * as repoJsLib from '/lib/jslibraries/repo';

const view = resolve('js-libraries-repo.html');

function handleGet(req: any) {
    const createFeaturesRepoResult = JSON.stringify(repoJsLib.create('features-repo'), null, 4);
    const getFeaturesRepoResult = JSON.stringify(repoJsLib.get('features-repo'), null, 4);
    const getFeaturesRepoRootNodeResult = JSON.stringify(repoJsLib.getRootNode('features-repo'), null, 4);
    const createBranchResult = JSON.stringify(repoJsLib.createBranch('features-repo', 'features-branch'), null, 4);
    const listReposResult = JSON.stringify(repoJsLib.list(), null, 4);
    const deleteFeaturesRepoResult = JSON.stringify(repoJsLib.delete('features-repo'), null, 4);
    const listReposResult2 = JSON.stringify(repoJsLib.list(), null, 4);

    const params = {
        createFeaturesRepoResult: createFeaturesRepoResult,
        getFeaturesRepoResult: getFeaturesRepoResult,
        getFeaturesRepoRootNodeResult: getFeaturesRepoRootNodeResult,
        createBranchResult: createBranchResult,
        listReposResult: listReposResult,
        deleteFeaturesRepoResult: deleteFeaturesRepoResult,
        listReposResult2: listReposResult2
    };

    const body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

export { handleGet as GET };
