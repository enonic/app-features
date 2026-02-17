var libPortal = require('/lib/xp/portal');
var libContent = require('/lib/xp/content');
var libThymeleaf = require('/lib/thymeleaf');
var auditLib = require('/lib/xp/auditlog');

var partView = resolve('auditLog.html');
var createView = resolve('./includes/createForm.html');
var tableView = resolve('./includes/auditLogTable.html');

function doLog(params) {
    var msg, errorMsg;
    try {
        var response = auditLib.log({
            type: params.type,
            time: params.time || null,
            source: params.source || null,
            user: params.user || null,
            objects: params.objects ? params.objects.split(',', -1) : [],
            data: JSON.parse(params.data || '{}')
        });
        msg = 'Audit Log was created : ' + response._id;
    } catch (e) {
        errorMsg = 'Error: ' + e.message;
    }

    return {
        contentType: 'text/html',
        body: libThymeleaf.render(createView, {
            msg: msg,
            errorMsg: errorMsg
        })
    };
}

function doFind(params) {
    var request = {
        start: params.start && /^\d+$/.test(params.start) ? parseInt(params.start) : 0,
        count: params.count && /^\d+$/.test(params.count) ? parseInt(params.count) : 10
    };

    if (params.from) {
        request.from = params.from;
    }
    if (params.to) {
        request.to = params.to;
    }
    if (params.type) {
        request.type = params.type;
    }
    if (params.source) {
        request.source = params.source;
    }
    if (params.ids) {
        request.ids = params.ids.split(",", -1);
    }
    if (params.users) {
        request.users = params.users.split(",", -1);
    }
    if (params.objects) {
        request.objects = params.objects.split(",", -1);
    }

    return {
        contentType: 'text/html',
        body: libThymeleaf.render(tableView, {
            auditLogs: auditLib.find(request).hits
        })
    };
}

function doGet(params) {
    var response = auditLib.get({
        id: params.id
    });

    return {
        contentType: 'application/json',
        body: JSON.stringify(response)
    }
}

function doExecute(params) {
    switch (params.operation) {
    case 'log':
        return doLog(params);
    case 'find':
        return doFind(params);
    case 'get':
        return doGet(params);
    default:
        throw Error("Unsupported operation");
    }
}

exports.get = function (req) {
    return {
        contentType: 'text/html',
        body: libThymeleaf.render(partView, {
            auditLogs: auditLib.find({}).hits,
            postUrl: libPortal.componentUrl({})
        }),
        pageContributions: {
            bodyEnd: [
                '<script src="' + libPortal.assetUrl({path: 'js/jquery-2.1.4.min.js'}) + '" type="text/javascript"></script>',
                '<script src="' + libPortal.assetUrl({path: 'js/parts/auditLog/auditLog.js'}) + '" type="text/javascript"></script>'
            ]
        }
    };
};

exports.post = function (req) {
    return doExecute(req.params);
};
