var portal = require('/lib/xp/portal');
var menuLib = require('/lib/menu');
var thymeleaf = require('/lib/thymeleaf');
var parentPath = './';
var view = resolve(parentPath + 'main.page.html');

function handleGet(req) {

    var editMode = req.mode == 'edit';

    var site = portal.getSite();
    var reqContent = portal.getContent();
    var params = {
        context: req,
        site: site,
        reqContent: reqContent,
        mainRegion: reqContent.page.regions["main"],
        editable: editMode,
        siteMenuItems: menuLib.getMenuTree(10).menuItems
    };
    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

exports.get = handleGet;


