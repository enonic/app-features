import * as portal from '/lib/xp/portal';
import * as thymeleaf from '/lib/thymeleaf';
import {assetUrl} from '/lib/enonic/asset';
import type {LayoutComponent, Request} from '@enonic-types/core';

export const GET = function (req: Request) {
    const component = portal.getComponent<LayoutComponent>();

    return {
        body: thymeleaf.render(resolve('./centered.html'), {
            centerRegion: component.regions["center"],
            resourcesPath: assetUrl({path: ''}),
        })
    };
};
