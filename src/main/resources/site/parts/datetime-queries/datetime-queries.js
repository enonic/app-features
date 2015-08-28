var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');
var contentSvc = require('/lib/xp/content');

var view = resolve('datetime-queries.page.html');

function handleGet(req) {

    var d = new Date();
    var nowISO = d.toISOString();
    var now = nowISO.slice(0, -1);

    log.info(now);

    var futureWithTZ = contentSvc.query({
        start: 0,
        count: 25,
        sort: 'data.datetime DESC',
        query: "_parentPath = '/content/features/input-types/date-and-time/datetime-queries' AND data.requiredDatetime > dateTime('" +
               nowISO + "')"
    });

    var pastWithTZ = contentSvc.query({
        start: 0,
        count: 25,
        sort: 'data.datetime DESC',
        query: "_parentPath = '/content/features/input-types/date-and-time/datetime-queries' AND data.requiredDatetime < dateTime('" +
               nowISO + "')"
    });

    var futureNoTZ = contentSvc.query({
        start: 0,
        count: 25,
        sort: 'data.datetime DESC',
        query: "_parentPath = '/content/features/input-types/date-and-time/datetime-queries' AND data.datetime > '" + now + "'"
    });

    var pastNoTZ = contentSvc.query({
        start: 0,
        count: 25,
        sort: 'data.datetime DESC',
        query: "_parentPath = '/content/features/input-types/date-and-time/datetime-queries' AND data.datetime < '" + now + "'"
    });

    var content = portal.getContent();
    var currentPage = portal.pageUrl({
        path: content._path
    });

    var params = {
        futureWithTZ: futureWithTZ.hits,
        futureNoTZ: futureNoTZ.hits,
        pastWithTZ: pastWithTZ.hits,
        pastNoTZ: pastNoTZ.hits,
        currentPage: currentPage
    };
    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

exports.get = handleGet;