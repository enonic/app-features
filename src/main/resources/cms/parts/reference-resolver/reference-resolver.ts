import * as portal from '/lib/xp/portal';
import * as contentLib from '/lib/xp/content';
const thymeleaf = require('/lib/thymeleaf') as any;
import type { Request } from '@enonic-types/core';

const view = resolve('reference-resolver.html');

function handleGet(req: Request) {
    const getSite = portal.getSite();
    const thisContent = portal.getContent() as any;

    const queryStr = "_references = '" + thisContent._id + "'";

    const incoming = contentLib.query({
        start: 0,
        count: 100,
        branch: "draft",
        query: queryStr
    } as any);

    const incomingRefs: any[] = [];
    incoming.hits.forEach(function(hit: any) {
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

export { handleGet as GET };
