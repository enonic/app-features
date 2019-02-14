var portal = require('/lib/xp/portal');
var i18n = require('/lib/xp/i18n');
var thymeleaf = require('/lib/thymeleaf');
var view = resolve('localization.html');

function handleGet(req) {

    var content = portal.getContent();
    var currentPage = portal.pageUrl({
        path: content._path
    });


    var complex_message = i18n.localize( {
        key: 'complex_message'
    });

    var complex_message_no = i18n.localize( {
        key: 'complex_message',
        locale: "no"
    });

    var message_multi_placeholder = i18n.localize( {
        key: 'message_multi_placeholder',
        locale: "no",
        values: ["Runar", "Oslo"]
    });

    var params = {
        currentPage: currentPage,
        complex_message: complex_message,
        complex_message_no: complex_message_no,
        message_multi_placeholder: message_multi_placeholder
    };

    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

exports.get = handleGet;