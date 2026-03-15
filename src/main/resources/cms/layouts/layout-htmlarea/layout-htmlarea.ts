import * as portal from '/lib/xp/portal';
import * as thymeleaf from '/lib/thymeleaf';
import type {LayoutComponent, Request} from '@enonic-types/core';

export const GET = function (req: Request) {
    const editMode = req.mode == 'edit';

    const content = portal.getContent();
    const component = portal.getComponent<LayoutComponent>();

    const view = resolve('layout-htmlarea.html');
    const body = thymeleaf.render(view, {
        title: content.displayName,
        path: content._path,
        name: content._name,
        editable: editMode,
        resourcesPath: portal.assetUrl({path: ''}),
        component: component,
        centerRegion: component.regions["center"]
    });

    return {
        body: body,
        contentType: 'text/html'
    };
};
