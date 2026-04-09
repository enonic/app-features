import * as clusterLib from '/lib/xp/cluster';
import * as thymeleaf from '/lib/thymeleaf';
import type {Request} from '@enonic-types/core';

const view = resolve('js-libraries-cluster.html');

function handleGet(req: Request) {
    const params = {
        isMaster: clusterLib.isMaster(),
        // @ts-ignore isLeader type not yet available in @enonic-types
        isLeader: clusterLib.isLeader()
    };

    const body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

export {handleGet as GET};
