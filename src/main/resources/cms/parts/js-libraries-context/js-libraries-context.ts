import * as portal from '/lib/xp/portal';
const thymeleaf = require('/lib/thymeleaf') as any;
import * as contextJsLib from '/lib/jslibraries/context';
import type { Request } from '@enonic-types/core';

const view = resolve('js-libraries-context.html');

function handleGet(req: Request) {
    const getContextResult = JSON.stringify(contextJsLib.getContext(), null, 4);
    const getContextAsAnonymousResult = JSON.stringify(contextJsLib.getContextAsAnonymous(), null, 4);
    const getContextWithAdditionalRoleResult = JSON.stringify(contextJsLib.getContextWithAdditionalRole(), null, 4);
    const getContextWithMasterBranchResult = JSON.stringify(contextJsLib.getContextWithMasterBranch(), null, 4);
    const getContextWithSystemRepositoryResult = JSON.stringify(contextJsLib.getContextWithSystemRepository(), null, 4);

    const params = {
        getContextResult: getContextResult,
        getContextAsAnonymousResult: getContextAsAnonymousResult,
        getContextWithAdditionalRoleResult: getContextWithAdditionalRoleResult,
        getContextWithMasterBranchResult: getContextWithMasterBranchResult,
        getContextWithSystemRepositoryResult: getContextWithSystemRepositoryResult
    };

    const body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

export { handleGet as GET };
