var portal = require('/lib/xp/portal');
var contentLib = require('/lib/xp/content');
var thymeleaf = require('/lib/xp/thymeleaf');
var view = resolve('reference-resolver.html');

function handleGet(req) {

    var getSite = portal.getSite();
    var thisContent = portal.getContent();

    var queryStr = "_references = '" + thisContent._id + "'";

    var incoming = contentLib.query({
        start: 0,
        count: 100,
        branch: "draft",
        query: queryStr
    });

    var incomingRefs = [];
    incoming.hits.forEach(function (hit) {
        incomingRefs.push(hit);
    });

    var params = {
        getSite: getSite,
        incomingRefs: incomingRefs
    };

    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

exports.get = handleGet;