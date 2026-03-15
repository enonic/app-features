import * as thymeleaf from '/lib/thymeleaf';
import * as i18nJsLib from '/lib/jslibraries/i18n';
import type {Request} from '@enonic-types/core';

const view = resolve('js-libraries-i18n.html');

function handleGet(req: Request) {
    const params = i18nJsLib.localize();

    const body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

export {handleGet as GET};
