import * as portal from '/lib/xp/portal';
const thymeleaf = require('/lib/thymeleaf') as any;
import type { Request } from '@enonic-types/core';

export const GET = function(req: Request) {
    const component = portal.getComponent() as any;

    return {
        body: thymeleaf.render(resolve('./centered.html'), {
            centerRegion: component.regions["center"],
            resourcesPath: portal.assetUrl({path: ''}),
        })
    };
};
