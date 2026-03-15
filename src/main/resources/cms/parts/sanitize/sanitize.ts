import * as portal from '/lib/xp/portal';
import * as ioLib from '/lib/xp/io';
import * as thymeleaf from '/lib/thymeleaf';
import type {Request} from '@enonic-types/core';

export const GET = function (req: Request) {
    const postUrl = portal.componentUrl({});

    const sampleHtmlRes = ioLib.getResource('/site/parts/sanitize/example1.html');
    const stream = sampleHtmlRes.getStream();
    const sampleHtml = ioLib.readText(stream);

    const params = {
        postUrl: postUrl,
        html: sampleHtml
    };

    const view = resolve('sanitize.html');
    const body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body,
        pageContributions: {
            headEnd: [
                '<link rel="stylesheet" href="' + portal.assetUrl({path: 'css/parts/sanitize/codemirror.css'}) + '" type="text/css" />',
                '<link rel="stylesheet" href="' + portal.assetUrl({path: 'css/parts/sanitize/sanitize.css'}) + '" type="text/css" />'
            ],
            bodyEnd: [
                '<script src="' + portal.assetUrl({path: 'js/jquery-2.1.4.min.js'}) + '" type="text/javascript"></script>',
                '<script src="' + portal.assetUrl({path: 'js/parts/sanitize/codemirror.js'}) + '" type="text/javascript"></script>',
                '<script src="' + portal.assetUrl({path: 'js/parts/sanitize/mode/css/css.js'}) + '" type="text/javascript"></script>',
                '<script src="' + portal.assetUrl({path: 'js/parts/sanitize/mode/javascript/javascript.js'}) +
                '" type="text/javascript"></script>',
                '<script src="' + portal.assetUrl({path: 'js/parts/sanitize/mode/xml/xml.js'}) + '" type="text/javascript"></script>',
                '<script src="' + portal.assetUrl({path: 'js/parts/sanitize/mode/htmlmixed/htmlmixed.js'}) +
                '" type="text/javascript"></script>',
                '<script src="' + portal.assetUrl({path: 'js/parts/sanitize/sanitize.js'}) + '" type="text/javascript"></script>'
            ]
        }
    };
};

export const POST = function (req: Request) {
    const html = req.params.html as string;

    const cleanHtml = portal.sanitizeHtml(html);

    return {
        contentType: 'application/json',
        body: {
            html: html,
            sanitized: cleanHtml
        }
    };
};
