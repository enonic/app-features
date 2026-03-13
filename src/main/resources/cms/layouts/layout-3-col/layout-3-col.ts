import * as portal from '/lib/xp/portal';
const thymeleaf = require('/lib/thymeleaf') as any;

export const get = function(req: any) {
    const editMode = req.mode == 'edit';

    const content = portal.getContent() as any;
    const component = portal.getComponent() as any;

    const view = resolve('layout-3-col.html');
    const body = thymeleaf.render(view, {
        title: content.displayName,
        path: content.path,
        name: content.name,
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
