import * as portal from '/lib/xp/portal';
import * as contentLib from '/lib/xp/content';
const thymeleaf = require('/lib/thymeleaf') as any;

export const get = function(req: any) {
    const view = resolve('publish.html');
    const body = thymeleaf.render(view, {
        postUrl: portal.componentUrl({})
    });

    return {
        contentType: 'text/html',
        body: body,
        pageContributions: {
            headEnd: [
                '<link rel="stylesheet" href="' + portal.assetUrl({path: 'css/parts/publish/publish.css'}) + '" type="text/css" />'
            ],
            bodyEnd: [
                '<script src="' + portal.assetUrl({path: 'js/jquery-2.1.4.min.js'}) + '" type="text/javascript"></script>',
                '<script src="' + portal.assetUrl({path: 'js/parts/publish/publish.js'}) + '" type="text/javascript"></script>'
            ]
        }
    };
};

export const post = function(req: any) {
    const includeChildren = req.params.includeChildren == 'true';
    const includeDependencies = req.params.includeDependencies == 'true';
    const keys = (req.params.keys || '').split(',');
    const sourceBranch = req.params.sourceBranch;
    const targetBranch = req.params.targetBranch;

    const publishParams = {
        keys: keys,
        sourceBranch: sourceBranch,
        targetBranch: targetBranch,
        includeChildren: includeChildren,
        includeDependencies: includeDependencies
    };
    log.info("Publish parameters %s", publishParams);

    const result = contentLib.publish(publishParams as any);

    log.info("Publish result %s", result);

    return {
        contentType: 'application/json',
        body: result
    };
};
