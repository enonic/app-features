import type {Request, Response} from '@enonic-types/core';
import {setCustomLocalAttribute} from '/lib/xp/context';

const CANONICAL_PATH_ATTRIBUTE = 'com.enonic.app.features.canonicalPath';

function firstValue(value: string | string[] | undefined): string | undefined {
    return Array.isArray(value) ? value[0] : value;
}

export const filter = function (req: Request, next: (req: Request) => Response): Response {
    const variant = firstValue(req.params.variant) ?? req.cookies.variant;

    if (variant === 'b' && req.contentPath && !/\/variant-b$/.test(req.contentPath)) {
        setCustomLocalAttribute(CANONICAL_PATH_ATTRIBUTE, req.contentPath);
        req.contentPath = `${req.contentPath}/variant-b`;
    }

    return next(req);
};
