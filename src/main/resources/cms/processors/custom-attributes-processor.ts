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

    const json = JSON.stringify(custom, null, 2);
    // A script element holds raw text, so the island escapes the one sequence that could end it
    // early, as a JSON escape that parses back to the same characters. The <pre> is markup, so
    // everything that could turn into an element is escaped there instead.
    const island = json.replace(/</g, '\\u003c');
    const escaped = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const pageContributions = res.pageContributions || {};
    res.pageContributions = pageContributions;
    const bodyEnd = ([] as string[]).concat(pageContributions.bodyEnd || []);

    // A data island rather than an executable script: the page script reads it from the DOM, so it
    // does not depend on this contribution running before the deferred page script.
    bodyEnd.push(`<script type="application/json" id="processor-attributes">${island}</script>`);
    bodyEnd.push(`<h2>Attributes as the response processor saw them</h2><pre>${escaped}</pre>`);
    pageContributions.bodyEnd = bodyEnd;

    return res;
};
