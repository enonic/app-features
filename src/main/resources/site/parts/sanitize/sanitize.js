var portal = require('/lib/xp/portal');
var ioLib = require('/lib/xp/io');
var thymeleaf = require('/lib/thymeleaf');


exports.get = function (req) {
    var postUrl = portal.componentUrl({});

    var sampleHtmlRes = ioLib.getResource('/site/parts/sanitize/example1.html');
    var stream = sampleHtmlRes.getStream();
    var sampleHtml = ioLib.readText(stream);

    var params = {
        postUrl: postUrl,
        html: sampleHtml
    };

    var view = resolve('sanitize.html');
    var body = thymeleaf.render(view, params);

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
                '<script src="' + portal.assetUrl({path: 'js/parts/sanitize/mode/javascript/javascript.js'}) + '" type="text/javascript"></script>',
                '<script src="' + portal.assetUrl({path: 'js/parts/sanitize/mode/xml/xml.js'}) + '" type="text/javascript"></script>',
                '<script src="' + portal.assetUrl({path: 'js/parts/sanitize/mode/htmlmixed/htmlmixed.js'}) + '" type="text/javascript"></script>',
                '<script src="' + portal.assetUrl({path: 'js/parts/sanitize/sanitize.js'}) + '" type="text/javascript"></script>'
            ]
        }
    };
};

exports.post = function (req) {
    var html = req.params.html;

    var cleanHtml = portal.sanitizeHtml(html);

    return {
        contentType: 'application/json',
        body: {
            html: html,
            sanitized: cleanHtml
        }
    };
};
