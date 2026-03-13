import * as portal from '/lib/xp/portal';
import * as i18n from '/lib/xp/i18n';
const thymeleaf = require('/lib/thymeleaf') as any;

const view = resolve('localization.html');

function handleGet(req: any) {
    const content = portal.getContent() as any;
    const currentPage = portal.pageUrl({
        path: content._path
    });

    const complex_message = i18n.localize({
        key: 'complex_message'
    });

    const complex_message_no = i18n.localize({
        key: 'complex_message',
        locale: "no"
    });

    const message_multi_placeholder = i18n.localize({
        key: 'message_multi_placeholder',
        locale: "no",
        values: ["Runar", "Oslo"]
    });

    const params = {
        currentPage: currentPage,
        complex_message: complex_message,
        complex_message_no: complex_message_no,
        message_multi_placeholder: message_multi_placeholder
    };

    const body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

export { handleGet as GET };
