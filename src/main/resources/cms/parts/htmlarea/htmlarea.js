var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/thymeleaf');

exports.get = function () {

    var content = portal.getContent();
    var view = resolve('htmlarea.html');

    var params = {
        content: content,
        htmlareavalue: content.data.htmlarea_text || ''
    };

    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };

};
