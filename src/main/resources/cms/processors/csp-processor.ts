import type {Request, MappedResponse} from '@enonic-types/core';
import {get as getContext} from '/lib/xp/context';
import {csp, cspReportOnly, CspSource} from '/lib/xp/portal';

const CSP_DEMO_ATTRIBUTE = 'com.enonic.app.features.cspDemo';

export const responseProcessor = function (req: Request, res: MappedResponse) {
    if (!getContext().attributes[`custom.${CSP_DEMO_ATTRIBUTE}`]) {
        return res;
    }

    const nonce = csp().nonceScriptSrc();

    cspReportOnly()
        .strict()
        .scriptSrc(CspSource.SELF)
        .styleSrc(CspSource.SELF)
        .imgSrc(CspSource.SELF)
        .connectSrc(CspSource.SELF);

    const pageContributions = res.pageContributions || {};
    res.pageContributions = pageContributions;
    const bodyEnd = ([] as string[]).concat(pageContributions.bodyEnd || []);
    bodyEnd.push(`<script nonce="${nonce}">window.processorScriptRan = true;</script>`);
    pageContributions.bodyEnd = bodyEnd;

    return res;
};
