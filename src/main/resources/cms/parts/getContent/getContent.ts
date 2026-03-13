import * as portal from '/lib/xp/portal';
const thymeleaf = require('/lib/thymeleaf') as any;

const view = resolve('getContent.html');

function handleGet(req: any) {
    const content = portal.getContent() as any;
    const currentPage = portal.pageUrl({
        path: content._path
    });

    const getSite = portal.getSite();
    const getComponent = portal.getComponent();
    const getContent = portal.getContent();

    const params = {
        getContent: getContent
    };

    const body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

export { handleGet as get };
