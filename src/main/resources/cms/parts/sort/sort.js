var portal = require('/lib/xp/portal');
var contentSvc = require('/lib/xp/content');
var thymeleaf = require('/lib/thymeleaf');

var view = resolve('sort-test.html');

function handleGet(req) {

    log.info("Request: %s", req);

    var content = portal.getContent();

    log.info("Content: %s", req);

    var currentPage = portal.pageUrl({
        path: content._path
    });

    var byDefault = contentSvc.getChildren({
        key: "/features/sorting/getchildren-test",
        start: 0,
        count: 1000
    });

    var byCreatedTime = contentSvc.getChildren({
        key: "/features/sorting/getchildren-test",
        start: 0,
        count: 1000,
        sort: 'createdTime DESC'
    });

    var byUpdateTime = contentSvc.getChildren({
        key: "/features/sorting/getchildren-test",
        start: 0,
        count: 1000,
        sort: 'modifiedTime DESC'
    });


    var params = {
        currentPage: currentPage,
        byCreatedTime: byCreatedTime,
        byUpdateTime: byUpdateTime,
        byDefault: byDefault
    };

    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

exports.get = handleGet;
