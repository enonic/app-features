import * as contentSvc from '/lib/xp/content';
import * as thymeleaf from '/lib/thymeleaf';
import type {Request} from '@enonic-types/core';

const view = resolve('sorting.html');

function handleGet(req: Request) {

    // A mapping controller has no page, so it links to its own request path rather than through
    // pageUrl, which belongs to the page concept.
    const currentPage = req.path;

    const byDefault = contentSvc.getChildren({
        key: "/samples/sorting/getchildren-test",
        start: 0,
        count: 1000
    });

    const byCreatedTime = contentSvc.getChildren({
        key: "/samples/sorting/getchildren-test",
        start: 0,
        count: 1000,
        sort: 'createdTime DESC'
    });

    const byUpdateTime = contentSvc.getChildren({
        key: "/samples/sorting/getchildren-test",
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

export {handleGet as GET};
