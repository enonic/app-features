import * as portal from '/lib/xp/portal';
import * as thymeleaf from '/lib/thymeleaf';

export const GET = function () {
    const content = portal.getContent();
    const view = resolve('htmlarea.html');

    const params = {
        content: content,
        htmlareavalue: content.data.htmlarea_text || ''
    };

    const body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
};
