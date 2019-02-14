var portal = require('/lib/xp/portal');
var contentSvc = require('/lib/xp/content');
var thymeleaf = require('/lib/thymeleaf');

var parentPath = './';
var view = resolve(parentPath + 'content.page.html');
var stk = require('/lib/stk/stk');

function handleGet(req) {
    var site = portal.getSite();
    var content = portal.getContent();
    var postUrl = stk.serviceUrl("content", {});

    if (req.params && req.params.contentId) {
        stk.log("Loading content with Id " + req.params.contentId);
        stk.log("Loading content with Id " + req.params.contentId);

        var result = contentSvc.get({
            key: req.params.contentId
        });

        stk.log(result);
    }

    var params = {
        post: content.data,
        pageTemplate: content.type === 'portal:page-template',
        site: site,
        content: content,
        postUrl: postUrl
    };
	
	var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

exports.get = handleGet;
