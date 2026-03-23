var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/thymeleaf');
var contentLib = require('/lib/xp/content');

exports.get = function (req) {
    var postUrl = portal.componentUrl({});

    var params = {
        postUrl: postUrl,
        key: '',
        patchData: '{\n    "displayName": "Patched Name"\n}',
        branches: '',
        skipSync: false
    };

    var view = resolve('patchContent.html');
    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body,
        pageContributions: {
            bodyEnd: [
                '<script src="' + portal.assetUrl({path: 'js/jquery-2.1.4.min.js'}) + '" type="text/javascript"></script>',
                '<script src="' + portal.assetUrl({path: 'js/parts/patchContent/patchContent.js'}) + '" type="text/javascript"></script>',
            ]
        }
    };
};

exports.post = function (req) {
    var key = req.params.key;
    var patchDataStr = req.params.patchData || '{}';
    var branchesStr = req.params.branches || '';
    var skipSync = req.params.skipSync === 'true';

    var errorMsg;
    var msg;
    var resultStr;

    try {
        var patchData = JSON.parse(patchDataStr);

        var branches = branchesStr ? branchesStr.split(',').map(function (b) {
            return b.trim();
        }).filter(function (b) {
            return b.length > 0;
        }) : [];

        var patchResult = contentLib.patch({
            key: key,
            patcher: function (content) {
                if (patchData.displayName != null) {
                    content.displayName = patchData.displayName;
                }
                if (patchData.data != null) {
                    Object.keys(patchData.data).forEach(function (field) {
                        content.data[field] = patchData.data[field];
                    });
                }
                if (patchData.language != null) {
                    content.language = patchData.language;
                }
                return content;
            },
            branches: branches,
            skipSync: skipSync
        });

        msg = 'Content patched: ' + patchResult.contentId;
        resultStr = JSON.stringify(patchResult, null, 4);

    } catch (e) {
        errorMsg = 'Error: ' + e.message;
    }

    var postUrl = portal.componentUrl({});
    var params = {
        postUrl: postUrl,
        key: key,
        patchData: patchDataStr,
        branches: branchesStr,
        skipSync: skipSync,
        errorMsg: errorMsg,
        msg: msg,
        result: resultStr
    };

    var view = resolve('patchContent.html');
    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body,
        pageContributions: {
            bodyEnd: [
                '<script src="' + portal.assetUrl({path: 'js/jquery-2.1.4.min.js'}) + '" type="text/javascript"></script>',
                '<script src="' + portal.assetUrl({path: 'js/parts/patchContent/patchContent.js'}) + '" type="text/javascript"></script>',
            ]
        }
    };
};
