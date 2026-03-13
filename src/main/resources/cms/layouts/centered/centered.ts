import * as portal from '/lib/xp/portal';
const thymeleaf = require('/lib/thymeleaf') as any;

export const GET = function(req: any) {
    const component = portal.getComponent() as any;

    return {
        body: thymeleaf.render(resolve('./centered.html'), {
            centerRegion: component.regions["center"],
            resourcesPath: portal.assetUrl({path: ''}),
        })
    };
};
