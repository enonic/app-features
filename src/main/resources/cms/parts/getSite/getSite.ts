import * as portal from '/lib/xp/portal';
const thymeleaf = require('/lib/thymeleaf') as any;

const view = resolve('getSite.html');

function handleGet(req: any) {
    const getSite = portal.getSite();

    const params = {
        getSite: getSite
    };

    const body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

export { handleGet as get };
