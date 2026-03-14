import * as portal from '/lib/xp/portal';
const thymeleaf = require('/lib/thymeleaf') as any;
import * as contentJsLib from '/lib/jslibraries/content';
import type { Request } from '@enonic-types/core';

const view = resolve('js-libraries-content.html');

function handleGet(req: Request) {
    const createResult = JSON.stringify(contentJsLib.create(), null, 4);
    const getResult = JSON.stringify(contentJsLib.get(), null, 4);
    const existsResult = JSON.stringify(contentJsLib.exists('/features/js-libraries/mycontent'), null, 4);
    const existsUnknownResult = JSON.stringify(contentJsLib.exists('unknown'), null, 4);
    const getChildrenResult = JSON.stringify(contentJsLib.getChildren(), null, 4);
    const queryResult = JSON.stringify(contentJsLib.query(), null, 4);
    const publishResult = JSON.stringify(contentJsLib.publish(), null, 4);
    const modifyResult = JSON.stringify(contentJsLib.modify(), null, 4);
    const getPermissionsResultBefore = JSON.stringify(contentJsLib.getPermissions(), null, 4);
    const applyPermissionsResult = JSON.stringify(contentJsLib.applyPermissions(), null, 4);
    const getPermissionsResultAfter = JSON.stringify(contentJsLib.getPermissions(), null, 4);
    const deleteResult = JSON.stringify(contentJsLib.delete(), null, 4);
    const publishResult2 = JSON.stringify(contentJsLib.publish(), null, 4);

    const params = {
        createResult: createResult,
        getResult: getResult,
        existsResult: existsResult,
        existsUnknownResult: existsUnknownResult,
        getChildrenResult: getChildrenResult,
        publishResult: publishResult,
        queryResult: queryResult,
        modifyResult: modifyResult,
        getPermissionsResultBefore: getPermissionsResultBefore,
        applyPermissionsResult: applyPermissionsResult,
        getPermissionsResultAfter: getPermissionsResultAfter,
        deleteResult: deleteResult,
        publishResult2: publishResult2
    };

    const body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

export { handleGet as GET };
