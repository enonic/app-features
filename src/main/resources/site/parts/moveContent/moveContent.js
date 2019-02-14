var portal = require('/lib/xp/portal');
var contentLib = require('/lib/xp/content');
var thymeleaf = require('/lib/thymeleaf');

var view = resolve('moveContent.html');

exports.get = function (req) {

    var postUrl = portal.componentUrl({});

    var params = {
        postUrl: postUrl
    };

    var body = thymeleaf.render(view, params);

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

exports.post = function (req) {
    var source = req.params.source;
    var target = req.params.target;

    var errorMsg;
    var msg;
    try {
        var moveResult = contentLib.move({
            source: source,
            target: target
        });

        msg = 'Content moved to: ' + moveResult._path;
    } catch (e) {
        if (e.code === 'contentAlreadyExist') {
            errorMsg = 'There is already a content with the target path';
        } else {
            errorMsg = 'Error: ' + e.message;
        }
    }

    var postUrl = portal.componentUrl({});
    var params = {
        postUrl: postUrl,
        source: source,
        target: target,
        errorMsg: errorMsg,
        msg: msg
    };

    var body = thymeleaf.render(view, params);

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