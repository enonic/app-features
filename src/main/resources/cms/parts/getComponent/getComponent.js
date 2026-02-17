var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/thymeleaf');
var view = resolve('getComponent.html');

function handleGet(req) {

    var getComponent = portal.getComponent();

    var params = {
        getComponent: getComponent
    };

    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

exports.get = handleGet;