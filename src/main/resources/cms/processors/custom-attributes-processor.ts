import type {Request, MappedResponse} from '@enonic-types/core';
import {get as getContext} from '/lib/xp/context';

const PAGE_ATTRIBUTE = 'com.enonic.app.features.pageMessage';

export const responseProcessor = function (req: Request, res: MappedResponse) {
    const attributes = getContext().attributes;
    if (!attributes[`custom.${PAGE_ATTRIBUTE}`]) {
        return res;
    }

    const custom: Record<string, unknown> = {};
    Object.keys(attributes).filter((key) => key.indexOf('custom.') === 0).forEach((key) => {
        custom[key] = attributes[key];
    });

    const escaped = JSON.stringify(custom, null, 2).replace(/</g, '&lt;');
    const pageContributions = res.pageContributions || {};
    res.pageContributions = pageContributions;
    const bodyEnd = ([] as string[]).concat(pageContributions.bodyEnd || []);

    // A data island rather than an executable script: the page script reads it from the DOM, so it
    // does not depend on this contribution running before the deferred page script.
    bodyEnd.push(`<script type="application/json" id="processor-attributes">${escaped}</script>`);
    bodyEnd.push(`<h2>Attributes as the response processor saw them</h2><pre>${escaped}</pre>`);
    pageContributions.bodyEnd = bodyEnd;

    return res;
};
