import * as portal from '/lib/xp/portal';
const thymeleaf = require('/lib/thymeleaf') as any;
import * as contentSvc from '/lib/xp/content';
import type { Request } from '@enonic-types/core';

const view = resolve('datetime-queries.page.html');

function handleGet(req: Request) {
    const d = new Date();
    const nowISO = d.toISOString();
    const now = nowISO.slice(0, -1);

    log.info(now);

    const futureWithTZ = contentSvc.query({
        start: 0,
        count: 25,
        sort: 'data.datetime DESC',
        query: "_parentPath = '/content/features/input-types/date-and-time/datetime-queries' AND data.requiredDatetime > dateTime('" +
               nowISO + "')"
    } as any);

    const pastWithTZ = contentSvc.query({
        start: 0,
        count: 25,
        sort: 'data.datetime DESC',
        query: "_parentPath = '/content/features/input-types/date-and-time/datetime-queries' AND data.requiredDatetime < dateTime('" +
               nowISO + "')"
    } as any);

    const futureNoTZ = contentSvc.query({
        start: 0,
        count: 25,
        sort: 'data.datetime DESC',
        query: "_parentPath = '/content/features/input-types/date-and-time/datetime-queries' AND data.datetime > '" + now + "'"
    } as any);

    const pastNoTZ = contentSvc.query({
        start: 0,
        count: 25,
        sort: 'data.datetime DESC',
        query: "_parentPath = '/content/features/input-types/date-and-time/datetime-queries' AND data.datetime < '" + now + "'"
    } as any);

    const content = portal.getContent() as any;
    const currentPage = portal.pageUrl({
        path: content._path
    });

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

export { handleGet as GET };
