exports.localize = function () {

    //Documentation BEGIN
    var i18n = require('/lib/xp/i18n');

    var phrasesNo = i18n.getPhrases('no', ['site/i18n/phrases'])

    // log.info("Norwegian phrases: " + JSON.stringify(phrasesNo));

    var locales = i18n.getSupportedLocales( ['site/i18n/phrases']);

    // log.info("Locales: " + JSON.stringify(locales));

    var complex_message = i18n.localize({
        key: 'complex_message'
    });

    var message_multi_placeholder = i18n.localize({
        key: 'message_multi_placeholder',
        locale: "no",
        values: ["John", "London"]
    });

    // log.info('Localize complex_message: ' + JSON.stringify(complex_message, null, 4));
    // log.info('Localize message_multi_placeholder: ' + JSON.stringify(message_multi_placeholder, null, 4));

    return {
        locales: locales,
        phrasesNo: phrasesNo,
        complex_message: complex_message,
        message_multi_placeholder: message_multi_placeholder
    }
};