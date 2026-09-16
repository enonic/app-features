import {csp, CspSource} from '/lib/xp/portal';
import * as thymeleaf from '/lib/thymeleaf';
import type {Request} from '@enonic-types/core';

const view = resolve('csp-image.html');

export const GET = function (req: Request) {
    if (req.mode !== 'edit') {
        csp().imgSrc(CspSource.DATA);
    }

    return {
        contentType: 'text/html',
        body: thymeleaf.render(view, {})
    };
};
