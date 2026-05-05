import * as portal from '/lib/xp/portal';
import * as thymeleaf from '/lib/thymeleaf';
import type {PartComponent} from '@enonic-types/core';

export const GET = function () {
    const component = portal.getComponent<PartComponent>();
    const view = resolve('paragraph.html');

    const params = {
        text: (component?.config.text as string | undefined) || ''
    };

    const body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
};
