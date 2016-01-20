var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');
var contentLib = require('/lib/xp/content');

exports.get = function (req) {
    var view = resolve('publish.html');
    var body = thymeleaf.render(view, {
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

exports.post = function (req) {
    var includeChildren = req.params.includeChildren == 'true';
    var includeDependencies = req.params.includeDependencies == 'true';
    var keys = (req.params.keys || '').split(',');
    var branch = req.params.branch;

    var publishParams = {
        keys: keys,
        targetBranch: branch,
        includeChildren: includeChildren,
        includeDependencies: includeDependencies
    };
    log.info("Publish parameters %s", publishParams);

    var result = contentLib.publish(publishParams);

    log.info("Publish result %s", result);

    return {
        contentType: 'application/json',
        body: result
    };
};
