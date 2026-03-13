import * as portal from '/lib/xp/portal';
const thymeleaf = require('/lib/thymeleaf') as any;

export const GET = function() {
    const content = portal.getContent() as any;
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
