var thymeleaf = require('/lib/xp/thymeleaf');
var view = resolve('js-libraries-view-functions.html');

function handleGet(req) {
    var body = thymeleaf.render(view, {});
    return {
        contentType: 'text/html',
        body: body
    };
}

exports.get = handleGet;