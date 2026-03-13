import * as portal from '/lib/xp/portal';
import * as menuLib from '/lib/menu';
const thymeleaf = require('/lib/thymeleaf') as any;

const parentPath = './';
const view = resolve(parentPath + 'main.page.html');

function handleGet(req: any) {
    const editMode = req.mode == 'edit';

    const site = portal.getSite();
    const reqContent = portal.getContent();

    const params = {
        context: req,
        site,
        reqContent,
        editable: editMode,
        siteMenuItems: menuLib.getMenuTree()
    };
    const body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

export { handleGet as get };
