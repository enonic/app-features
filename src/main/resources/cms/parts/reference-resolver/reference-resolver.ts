import * as portal from '/lib/xp/portal';
import * as contentLib from '/lib/xp/content';
import * as thymeleaf from '/lib/thymeleaf';
import type {Request, Content} from '@enonic-types/core';

const view = resolve('reference-resolver.html');

function handleGet(req: Request) {
    const getSite = portal.getSite();
    const thisContent = portal.getContent();

    const queryStr = "_references = '" + thisContent._id + "'";

    const incoming = contentLib.query({
        start: 0,
        count: 100,
        query: queryStr
    });

    const incomingRefs: Content[] = [];
    incoming.hits.forEach(function (hit: Content) {
        incomingRefs.push(hit);
    });

    const params = {
        getSite: getSite,
        incomingRefs: incomingRefs
    };

    const body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

export {handleGet as GET};
