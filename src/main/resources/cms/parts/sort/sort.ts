import * as portal from '/lib/xp/portal';
import * as contentSvc from '/lib/xp/content';
const thymeleaf = require('/lib/thymeleaf') as any;

const view = resolve('sort-test.html');

function handleGet(req: any) {
    log.info("Request: %s", req);

    const content = portal.getContent() as any;

    log.info("Content: %s", req);

    const currentPage = portal.pageUrl({
        path: content._path
    });

    const byDefault = contentSvc.getChildren({
        key: "/features/sorting/getchildren-test",
        start: 0,
        count: 1000
    });

    const byCreatedTime = contentSvc.getChildren({
        key: "/features/sorting/getchildren-test",
        start: 0,
        count: 1000,
        sort: 'createdTime DESC'
    });

    const byUpdateTime = contentSvc.getChildren({
        key: "/features/sorting/getchildren-test",
        start: 0,
        count: 1000,
        sort: 'modifiedTime DESC'
    });

    const params = {
        currentPage: currentPage,
        byCreatedTime: byCreatedTime,
        byUpdateTime: byUpdateTime,
        byDefault: byDefault
    };

    const body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

export { handleGet as GET };
