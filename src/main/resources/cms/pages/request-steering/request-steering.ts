import * as portal from '/lib/xp/portal';
import * as contentLib from '/lib/xp/content';
import {get as getContext} from '/lib/xp/context';
import * as thymeleaf from '/lib/thymeleaf';
import {assetUrl} from '/lib/enonic/asset';
import type {Request} from '@enonic-types/core';
import type {PageUrlParams} from '@enonic-types/lib-portal';

const view = resolve('request-steering.html');

const CANONICAL_PATH_ATTRIBUTE = 'com.enonic.app.features.canonicalPath';

function requestedPathOf(req: Request): string {
    return req.path;
}

function firstValue(value: string | string[] | undefined): string | undefined {
    return Array.isArray(value) ? value[0] : value;
}

export const GET = function (req: Request) {
    const content = portal.getContent();
    const canonicalFromFilter = getContext().attributes[`custom.${CANONICAL_PATH_ATTRIBUTE}`] as string | undefined;
    const rerouted = !!canonicalFromFilter;

    const variantOf = content.variantOf;

    function lookup(key: string): {content: ReturnType<typeof contentLib.get>; error: string | null} {
        try {
            const found = contentLib.get({key});
            return {content: found, error: found ? null : 'no content found for that key in this branch'};
        } catch (e) {
            return {content: null, error: `lookup failed: ${(e as Error).message || String(e)}`};
        }
    }

    const byId = variantOf ? lookup(variantOf) : null;
    const variantParent = byId?.content ?? null;
    const variantLookupError = byId?.error ?? null;

    const parentPathGuess = content._path.replace(/\/[^/]+$/, '');
    const byPath = variantOf ? lookup(parentPathGuess) : null;

    let canonicalPath: string | null;
    let canonicalSource: string;
    if (canonicalFromFilter) {
        canonicalPath = canonicalFromFilter;
        canonicalSource = 'the filter, handed over with setCustomLocalAttribute()';
    } else if (variantParent) {
        canonicalPath = variantParent._path;
        canonicalSource = 'the variantOf property of this content';
    } else if (variantOf) {
        canonicalPath = null;
        canonicalSource = `variantOf is set, but the canonical content could not be read: ${variantLookupError}`;
    } else {
        canonicalPath = null;
        canonicalSource = 'nowhere - this content is itself the canonical one';
    }

    const canonicalOrSelf = canonicalPath ?? content._path;
    const selfUrl = portal.pageUrl({} as PageUrlParams);
    const canonicalUrl = portal.pageUrl({path: canonicalOrSelf});
    const variantRequested = (firstValue(req.params.variant) ?? req.cookies.variant) === 'b';
    const isVariantPath = /\/variant-b$/.test(content._path);
    const askedAtVariantPath = !rerouted && isVariantPath;
    const rerouteExpected = variantRequested && !askedAtVariantPath;

    const role = variantOf
        ? 'This is a variant'
        : 'This is the canonical content';

    const roleDetail = variantOf
        ? (variantParent
            ? `a variant of ${variantParent.displayName} at ${variantParent._path}`
            : `variantOf points at ${variantOf}, which could not be read: ${variantLookupError}`)
        : 'no variantOf is set, so nothing points further up';

    const routeDetail = rerouted
        ? `rendered at ${requestedPathOf(req)} because the filter re-routed the request`
        : 'rendered at its own address, with no re-route';

    const checks = [
        {
            label: 'A variant was requested and the filter re-routed rendering',
            expected: rerouteExpected
                ? 'a re-route, because a variant was requested on the canonical address'
                : (askedAtVariantPath
                    ? 'no re-route, because the variant path is outside the filter pattern'
                    : 'no re-route, because no variant was requested'),
            actual: rerouted
                ? `re-routed to ${content._path}`
                : `rendered ${content._path} as requested`,
            ok: rerouted === rerouteExpected,
            skipped: false
        },
        {
            label: 'pageUrl() with no path follows the rendered content',
            expected: `a URL ending in ${content._path}`,
            actual: selfUrl,
            ok: selfUrl.indexOf(content._path) === selfUrl.length - content._path.length,
            skipped: false
        },
        {
            label: 'The canonical address is known, and is not this content',
            expected: rerouted || variantParent
                ? 'the canonical path, different from the rendered path'
                : 'not applicable on the canonical content itself',
            actual: canonicalPath ? canonicalPath : 'none',
            ok: !!canonicalPath && canonicalPath !== content._path,
            skipped: !rerouted && !variantParent
        },
        {
            label: 'The same content is readable by path',
            expected: variantOf
                ? 'the canonical content, read with its path instead of its id'
                : 'not applicable, this content is not a variant',
            actual: byPath
                ? (byPath.content
                    ? `${byPath.content.displayName} at ${byPath.content._path}`
                    : `path ${parentPathGuess} - ${byPath.error}`)
                : 'not a variant',
            ok: !!byPath?.content,
            skipped: !variantOf
        },
        {
            label: 'variantOf resolves to the canonical content, read by id',
            expected: variantOf
                ? 'the content this one is a variant of'
                : 'not applicable, this content is not a variant',
            actual: variantOf
                ? (variantParent
                    ? `${variantParent.displayName} at ${variantParent._path}`
                    : `id ${variantOf} - ${variantLookupError}`)
                : 'not a variant',
            ok: !!variantParent,
            skipped: !variantOf
        }
    ];

    return {
        contentType: 'text/html',
        body: thymeleaf.render(view, {
            content,
            checks: checks.filter((check) => !check.skipped),
            role,
            roleDetail,
            routeDetail,
            requestedPath: req.path,
            rerouted,
            canonicalPath: canonicalPath ?? 'none',
            canonicalSource,
            variantOf: variantOf ?? 'not set',
            variantParentPath: variantParent
                ? variantParent._path
                : (variantOf ? (variantLookupError ?? 'unresolved') : 'not a variant'),
            editable: req.mode === 'edit',
            selfUrl,
            canonicalUrl,
            variantParamUrl: portal.pageUrl({path: canonicalOrSelf, params: {variant: 'b'}}),
            variantDirectUrl: portal.pageUrl({path: canonicalOrSelf + '/variant-b'}),
            stylesUrl: assetUrl({path: 'styles.css'}),
            scriptUrl: assetUrl({path: 'js/pages/request-steering/request-steering.js'})
        })
    };
};
