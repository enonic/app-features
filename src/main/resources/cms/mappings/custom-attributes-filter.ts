import type {Request, Response} from '@enonic-types/core';
import {get as getContext, setCustomLocalAttribute} from '/lib/xp/context';

const FILTER_ATTRIBUTE = 'com.enonic.app.features.filterMessage';

export const filter = function (req: Request, next: (req: Request) => Response): Response {
    setCustomLocalAttribute(FILTER_ATTRIBUTE, 'set by the filter before next()');
    (req as Request & {legacyFlag?: boolean}).legacyFlag = true;

    const response = next(req);

    const attributes = getContext().attributes;
    const custom: Record<string, unknown> = {};
    Object.keys(attributes).filter((key) => key.indexOf('custom.') === 0).forEach((key) => {
        custom[key] = attributes[key];
    });

    response.headers = response.headers || {};
    response.headers['X-Custom-Attributes'] = JSON.stringify(custom);

    return response;
};
