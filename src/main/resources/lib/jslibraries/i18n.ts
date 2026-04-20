export function localize() {
    const i18n = require('/lib/xp/i18n');

    const phrasesNo = i18n.getPhrases('no');

    const locales = i18n.getSupportedLocales();

    const complex_message = i18n.localize({
        key: 'complex_message'
    });

    const message_multi_placeholder = i18n.localize({
        key: 'message_multi_placeholder',
        locale: "no",
        values: ["John", "London"]
    });

    return {
        locales: locales,
        phrasesNo: phrasesNo,
        complex_message: complex_message,
        message_multi_placeholder: message_multi_placeholder
    };
}
