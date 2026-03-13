import * as portal from '/lib/xp/portal';
import * as contentSvc from '/lib/xp/content';
const thymeleaf = require('/lib/thymeleaf') as any;
import * as stk from '/lib/stk/stk';

const parentPath = './';
const view = resolve(parentPath + 'content.page.html');

function handleGet(req: any) {
    const site = portal.getSite();
    const content = portal.getContent() as any;
    const postUrl = stk.serviceUrl("content", {});

    if (req.params && req.params.contentId) {
        stk.log("Loading content with Id " + req.params.contentId);
        stk.log("Loading content with Id " + req.params.contentId);

        const result = contentSvc.get({
            key: req.params.contentId
        });

        stk.log(result);
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

export { handleGet as GET };
