import * as portal from '/lib/xp/portal';
import * as thymeleaf from '/lib/thymeleaf';
import type {LayoutComponent, Request} from '@enonic-types/core';

export const GET = function (req: Request) {
    const editMode = req.mode == 'edit';

    const content = portal.getContent();
    const component = portal.getComponent<LayoutComponent>();

    const view = resolve('layout-3-col.html');
    const body = thymeleaf.render(view, {
        title: content.displayName,
        path: content._path,
        name: content._name,
        editable: editMode,
        resourcesPath: portal.assetUrl({path: ''}),
        component: component,
        leftRegion: component.regions["left"],
        centerRegion: component.regions["center"],
        rightRegion: component.regions["right"]
    });

    return {
        body: body,
        contentType: 'text/html'
    };
};
