import * as portal from '/lib/xp/portal';
import * as contentLib from '/lib/xp/content';
const thymeleaf = require('/lib/thymeleaf') as any;

export const GET = function(req: any) {
    const view = resolve('unpublish.html');
    const body = thymeleaf.render(view, {
        postUrl: portal.componentUrl({})
    });

    return {
        contentType: 'text/html',
        body: body,
        pageContributions: {
            headEnd: [
                '<link rel="stylesheet" href="' + portal.assetUrl({path: 'css/parts/unpublish/unpublish.css'}) + '" type="text/css" />'
            ],
            bodyEnd: [
                '<script src="' + portal.assetUrl({path: 'js/jquery-2.1.4.min.js'}) + '" type="text/javascript"></script>',
                '<script src="' + portal.assetUrl({path: 'js/parts/unpublish/unpublish.js'}) + '" type="text/javascript"></script>'
            ]
        }
    };
};

export const POST = function(req: any) {
    const keys = (req.params.keys || '').split(',');

    const unpublishParams = {
        keys: keys
    };
    log.info("Unpublish parameters %s", unpublishParams);

    const result = contentLib.unpublish(unpublishParams);

    log.info("Unpublish result %s", result);

    return {
        contentType: 'application/json',
        body: JSON.stringify(result)
    };
};
