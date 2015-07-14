var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');
var view = resolve('getContent.html');

function handleGet(req) {

    var content = portal.getContent();
    var currentPage = portal.pageUrl({
        path: content._path
    });

    var getSite = portal.getSite();

    var getComponent = portal.getComponent();

    var getContent = portal.getContent();


    var params = {
        getContent: getContent
    };

    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

exports.get = handleGet;