import * as portal from '/lib/xp/portal';
const thymeleaf = require('/lib/thymeleaf') as any;

const view = resolve('getComponent.html');

function handleGet(req: any) {
    const getComponent = portal.getComponent();

    const params = {
        getComponent: getComponent
    };

    const body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

export { handleGet as get };
