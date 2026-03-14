import * as clusterLib from '/lib/xp/cluster';
const thymeleaf = require('/lib/thymeleaf') as any;
import type { Request } from '@enonic-types/core';

const view = resolve('js-libraries-cluster.html');

function handleGet(req: Request) {
    const params = {
        isMaster: clusterLib.isMaster()
    };

    const body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

export { handleGet as GET };
