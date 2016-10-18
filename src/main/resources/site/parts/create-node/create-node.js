var portalLib = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');

function handleGet(req) {
    var url = portalLib.serviceUrl({
        service: 'node-service'
    });

    var params = {
        serviceUrl: url
    };

    var view = resolve('create-node.html');
    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}


exports.get = handleGet;
