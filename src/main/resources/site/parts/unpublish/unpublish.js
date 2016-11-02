var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');
var contentLib = require('/lib/xp/content');

exports.get = function (req) {
    var view = resolve('unpublish.html');
    var body = thymeleaf.render(view, {
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

exports.post = function (req) {
    var keys = (req.params.keys || '').split(',');

    var unpublishParams = {
        keys: keys
    };
    log.info("Unpublish parameters %s", unpublishParams);

    var result = contentLib.unpublish(unpublishParams);

    log.info("Unpublish result %s", result);

    return {
        contentType: 'application/json',
        body: JSON.stringify(result)
    };
};
