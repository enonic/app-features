import * as portal from '/lib/xp/portal';
import * as contentSvc from '/lib/xp/content';
import * as thymeleaf from '/lib/thymeleaf';
import * as stk from '/lib/stk/stk';
import type {Request} from '@enonic-types/core';

const parentPath = './';
const view = resolve(parentPath + 'content.page.html');

function handleGet(req: Request) {
    const site = portal.getSite();
    const content = portal.getContent();
    const postUrl = stk.serviceUrl("content", {});

    if (req.params && req.params.contentId) {
        stk.logStk("Loading content with Id " + req.params.contentId);
        stk.logStk("Loading content with Id " + req.params.contentId);

        const result = contentSvc.get({
            key: req.params.contentId as string
        });

        stk.logStk(result);
    }

    const params = {
        post: content.data,
        pageTemplate: content.type === 'portal:page-template',
        site: site,
        content: content,
        postUrl: postUrl
    };

    const body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

export {handleGet as GET};
