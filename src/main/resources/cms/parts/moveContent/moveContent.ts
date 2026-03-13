import * as portal from '/lib/xp/portal';
import * as contentLib from '/lib/xp/content';
const thymeleaf = require('/lib/thymeleaf') as any;

const view = resolve('moveContent.html');

export const get = function(req: any) {
    const postUrl = portal.componentUrl({});

    const params = {
        postUrl: postUrl
    };

    const body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body,
        pageContributions: {
            bodyEnd: [
                '<script src="' + portal.assetUrl({path: 'js/jquery-2.1.4.min.js'}) + '" type="text/javascript"></script>',
                '<script src="' + portal.assetUrl({path: 'js/parts/moveContent/moveContent.js'}) + '" type="text/javascript"></script>',
            ]
        }
    };
};

export const post = function(req: any) {
    const source = req.params.source;
    const target = req.params.target;

    let errorMsg: any;
    let msg: any;
    try {
        const moveResult = contentLib.move({
            source: source,
            target: target
        }) as any;

        msg = 'Content moved to: ' + moveResult._path;
    } catch (e: any) {
        if (e.code === 'contentAlreadyExist') {
            errorMsg = 'There is already a content with the target path';
        } else {
            errorMsg = 'Error: ' + e.message;
        }
    }

    const postUrl = portal.componentUrl({});
    const params = {
        postUrl: postUrl,
        source: source,
        target: target,
        errorMsg: errorMsg,
        msg: msg
    };

    const body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body,
        pageContributions: {
            bodyEnd: [
                '<script src="' + portal.assetUrl({path: 'js/jquery-2.1.4.min.js'}) + '" type="text/javascript"></script>',
                '<script src="' + portal.assetUrl({path: 'js/parts/moveContent/moveContent.js'}) + '" type="text/javascript"></script>',
            ]
        }
    };
};
