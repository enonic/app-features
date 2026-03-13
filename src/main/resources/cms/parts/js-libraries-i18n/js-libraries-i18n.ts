import * as portal from '/lib/xp/portal';
const thymeleaf = require('/lib/thymeleaf') as any;
import * as i18nJsLib from '/lib/jslibraries/i18n';

const view = resolve('js-libraries-i18n.html');

function handleGet(req: any) {
    const params = i18nJsLib.localize();

    const body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

export { handleGet as get };
