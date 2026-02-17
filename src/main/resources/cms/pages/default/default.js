const portal = require('/lib/xp/portal');
const menuLib = require('/lib/menu');
const thymeleaf = require('/lib/thymeleaf');
const parentPath = './';
const view = resolve(parentPath + 'default.page.html');

function handleGet(req) {

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

exports.get = handleGet;


