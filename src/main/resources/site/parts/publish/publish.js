var portal = require('/lib/xp/portal');
var contentLib = require('/lib/xp/content');
var thymeleaf = require('/lib/thymeleaf');

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
    var sourceBranch = req.params.sourceBranch;
    var targetBranch = req.params.targetBranch;

    var publishParams = {
        keys: keys,
        sourceBranch: sourceBranch,
        targetBranch: targetBranch,
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
