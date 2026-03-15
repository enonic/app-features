import * as portal from '/lib/xp/portal';
import * as thymeleaf from '/lib/thymeleaf';
import type {Request} from '@enonic-types/core';

const view = resolve('getContent.html');

function handleGet(req: Request) {
    const content = portal.getContent();
    const currentPage = portal.pageUrl({
        path: content._path
    });

    const getSite = portal.getSite();
    const getComponent = portal.getComponent();
    const getContent = portal.getContent();

    const params = {
        getContent: getContent
    };

    const body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

export {handleGet as GET};
