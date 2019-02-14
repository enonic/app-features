exports.localize = function () {

    //Documentation BEGIN
    var i18n = require('/lib/xp/i18n');

    var complex_message = i18n.localize({
        key: 'complex_message'
    });

    var message_multi_placeholder = i18n.localize({
        key: 'message_multi_placeholder',
        locale: "no",
        values: ["John", "London"]
    });
    //Documentation END

    log.info('Localize complex_message: ' + JSON.stringify(complex_message, null, 4));
    log.info('Localize message_multi_placeholder: ' + JSON.stringify(message_multi_placeholder, null, 4));

    return complex_message + message_multi_placeholder;
};