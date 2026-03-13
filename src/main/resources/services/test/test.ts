import * as portal from '/lib/xp/portal';
import type { Request } from '@enonic-types/core';

function handleGet(req: Request) {
    const site = portal.getSite();

    return {
        contentType: 'application/json',
        body: site
    };
}

export { handleGet as GET };
