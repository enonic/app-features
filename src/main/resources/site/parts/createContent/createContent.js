var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/thymeleaf');
var contentSvc = require('/lib/xp/content');

exports.get = function (req) {
    var component = portal.getComponent();
    var targetFolder = component.config.targetFolder;
    var parentPath = '';
    if (targetFolder) {
        var folder = contentSvc.get({
            key: targetFolder
        });
        parentPath = folder ? folder._path : '';
    }

    var postUrl = portal.componentUrl({});

    var params = {
        postUrl: postUrl,
        parentPath: parentPath,
        displayName: '',
        contentName: '',
        contentType: 'base:unstructured',
        contentData: '{}',
        contentXData: '{}'
    };

    var view = resolve('createContent.html');
    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body,
        pageContributions: {
            bodyEnd: [
                '<script src="' + portal.assetUrl({path: 'js/jquery-2.1.4.min.js'}) + '" type="text/javascript"></script>',
                '<script src="' + portal.assetUrl({path: 'js/parts/createContent/createContent.js'}) + '" type="text/javascript"></script>',
            ]
        }
    };
};

exports.post = function (req) {
    var name = req.params.name;
    var displayName = req.params.displayName;
    var parentPath = req.params.parent;
    var contentType = req.params.contentType || 'base:unstructured';
    var dataStr = req.params.contentData || '{}';
    var xDataStr = req.params.contentXData || '{}';

    var errorMsg;
    var msg;
    try {
        var data = JSON.parse(dataStr);
        var xdata = JSON.parse(xDataStr);

        var createResult = contentSvc.create({
            name: name,
            parentPath: parentPath,
            displayName: displayName,
            contentType: contentType,
            data: data,
            x: xdata
        });

        msg = 'Content created: ' + createResult._path;
        name = createResult._name;
        dataStr = JSON.stringify(createResult.data, null, 4);
        xDataStr = JSON.stringify(createResult.x, null, 4);
    } catch (e) {
        if (e.code === 'contentAlreadyExist') {
            errorMsg = 'There is already a content with that name';
        } else {
            errorMsg = 'Error: ' + e.message;
        }
    }

    var postUrl = portal.componentUrl({});
    var params = {
        postUrl: postUrl,
        parentPath: parentPath,
        displayName: displayName,
        contentName: name,
        contentType: contentType,
        contentData: dataStr,
        contentXData: xDataStr, 
        errorMsg: errorMsg,
        msg: msg
    };

    var view = resolve('createContent.html');
    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body,
        pageContributions: {
            bodyEnd: [
                '<script src="' + portal.assetUrl({path: 'js/jquery-2.1.4.min.js'}) + '" type="text/javascript"></script>',
                '<script src="' + portal.assetUrl({path: 'js/parts/createContent/createContent.js'}) + '" type="text/javascript"></script>',
            ]
        }
    };
};