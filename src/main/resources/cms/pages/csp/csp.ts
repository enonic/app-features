import * as portal from '/lib/xp/portal';
import {csp, CspSource} from '/lib/xp/portal';
import {setCustomLocalAttribute} from '/lib/xp/context';
import * as thymeleaf from '/lib/thymeleaf';
import {assetUrl} from '/lib/enonic/asset';
import type {Request} from '@enonic-types/core';

const view = resolve('csp.html');

const CSP_DEMO_ATTRIBUTE = 'com.enonic.app.features.cspDemo';

export const GET = function (req: Request) {
    const content = portal.getContent();

    let scriptNonce = '';
    let styleNonce = '';
    if (req.mode !== 'edit') {
        setCustomLocalAttribute(CSP_DEMO_ATTRIBUTE, true);

        const policy = csp();
        if (req.mode === 'live') {
            policy.strict();
        } else {
            policy.defaultSrc(CspSource.NONE).baseUri(CspSource.NONE).frameAncestors(CspSource.SELF);
        }
        policy
            .scriptSrc(CspSource.SELF)
            .styleSrc(CspSource.SELF)
            .imgSrc(CspSource.SELF)
            .connectSrc(CspSource.SELF);
        scriptNonce = policy.nonceScriptSrc();
        styleNonce = policy.nonceStyleSrc();
    }

    return {
        contentType: 'text/html',
        body: thymeleaf.render(view, {
            content,
            scriptNonce,
            styleNonce,
            editable: req.mode === 'edit',
            stylesUrl: assetUrl({path: 'styles.css'}),
            scriptUrl: assetUrl({path: 'js/pages/csp/csp.js'})
        })
    };
};
