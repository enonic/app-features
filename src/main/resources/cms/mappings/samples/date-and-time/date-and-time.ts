import * as thymeleaf from '/lib/thymeleaf';
import * as contentSvc from '/lib/xp/content';
import type {Request} from '@enonic-types/core';

const view = resolve('date-and-time.html');

function handleGet(req: Request) {
    const d = new Date();
    const nowISO = d.toISOString();
    const now = nowISO.slice(0, -1);

    log.info(now);

    const futureWithTZ = contentSvc.query({
        start: 0,
        count: 25,
        sort: 'data.datetime DESC',
        query: "_parentPath = '/content/samples/form-items/date-and-time/datetime-queries' AND data.requiredDatetime > dateTime('" +
               nowISO + "')"
    });

    const pastWithTZ = contentSvc.query({
        start: 0,
        count: 25,
        sort: 'data.datetime DESC',
        query: "_parentPath = '/content/samples/form-items/date-and-time/datetime-queries' AND data.requiredDatetime < dateTime('" +
               nowISO + "')"
    });

    const futureNoTZ = contentSvc.query({
        start: 0,
        count: 25,
        sort: 'data.datetime DESC',
        query: "_parentPath = '/content/samples/form-items/date-and-time/datetime-queries' AND data.datetime > '" + now + "'"
    });

    const pastNoTZ = contentSvc.query({
        start: 0,
        count: 25,
        sort: 'data.datetime DESC',
        query: "_parentPath = '/content/samples/form-items/date-and-time/datetime-queries' AND data.datetime < '" + now + "'"
    });

    // A mapping controller has no page, so it links to its own request path rather than through
    // pageUrl, which belongs to the page concept.
    const currentPage = req.path;

    const params = {
        futureWithTZ: futureWithTZ.hits,
        futureNoTZ: futureNoTZ.hits,
        pastWithTZ: pastWithTZ.hits,
        pastNoTZ: pastNoTZ.hits,
        currentPage: currentPage
    };
    const body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

export {handleGet as GET};
