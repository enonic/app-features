import * as contentLib from '/lib/xp/content';
import {run as runInContext} from '/lib/xp/context';
import * as portal from '/lib/xp/portal';
import * as thymeleaf from '/lib/thymeleaf';
import type {Request} from '@enonic-types/core';
import type {PageUrlParams} from '@enonic-types/lib-portal';

const view = resolve('pageUrl.html');

const OTHER_PATH = '/features/request-steering';

// Two kinds of call, worth keeping apart because they resolve differently.
//
// A request-relative call is answered against the request being served, so it follows the vhost
// and comes out relative to it. A cross-context call names another project or branch, which the
// request cannot supply, so it is resolved from content alone: anchored to the base URL of the
// target's nearest site if there is one, and otherwise falling back to the site service path,
// /site/<project>/<branch>/..., which is not a public address.
const REQUEST = 'Request-relative';
const CROSS = 'Cross-context';

// The site's base URL lives in siteConfig under the reserved `portal` application key, not in this
// app's own config, so getSiteConfig() cannot reach it. When set, generated absolute URLs are
// anchored to it instead of to the host the request arrived on, which is what lets a widget or a
// background job build a working URL with no request to borrow a host from.
// Under a vhost the site prefix is stripped, so a generated URL ends with the path relative to the
// site rather than with the full content path. That holds with or without a vhost, which makes it
// the invariant worth asserting.
//
// The site to measure against is the target's own nearest site, not the site rendering this page.
// The two differ when a page inside a nested site generates a URL for content in the parent site:
// the URL is anchored to the parent, so measuring against the nested site is wrong.
function siteRelative(path: string): string {
    const site = contentLib.getSite({key: path}) ?? portal.getSite();
    return site && path.indexOf(site._path) === 0 ? path.substring(site._path.length) : path;
}

function baseUrlOf(site: {data?: unknown} | null): string {
    const raw = (site?.data as {siteConfig?: unknown} | undefined)?.siteConfig;
    const configs = raw
        ? ([] as {applicationKey?: string; config?: {baseUrl?: string}}[]).concat(raw as never)
        : [];

    return configs.filter((entry) => entry.applicationKey === 'portal')[0]?.config?.baseUrl ?? '';
}

function siteBaseUrl(): string {
    return baseUrlOf(portal.getSite());
}

// The base URL is content, so it is per branch: a value edited on draft and not yet published is
// not the value master carries. A URL asked for in another branch resolves that branch's site
// config, so the expectation has to be read from there too rather than from this request's branch.
function baseUrlInBranch(path: string, branch: string): string {
    // Read with the admin role on purpose. A visitor who cannot see the other branch would other-
    // wise leave the expectation undecidable, and the row would fail for lack of information rather
    // than because the URL was wrong. Site config is not a secret, and the value read is shown.
    try {
        return runInContext(
            {branch, principals: ['role:system.admin']},
            () => baseUrlOf(contentLib.getSite({key: path}))
        );
    } catch (e) {
        return '';
    }
}

interface Row {
    group: string;
    call: string;
    expected: string;
    got: string;
    verdict: string;
    cls: string;
    link: boolean;
}

// A result is offered as a link when a browser can follow it. A ws:// URL is a real result but not
// navigable, and an error message is not a URL at all, so both stay as text.
function navigable(value: string): boolean {
    return value.indexOf('/') === 0 || value.indexOf('http://') === 0 || value.indexOf('https://') === 0;
}

function row(group: string, call: string, expected: string, fn: () => {ok: boolean; got: string}): Row {
    try {
        const result = fn();
        return {
            group,
            call,
            expected,
            got: result.got,
            verdict: result.ok ? 'pass' : 'FAIL',
            cls: result.ok ? 'ok' : 'blocked',
            link: navigable(result.got)
        };
    } catch (e) {
        return {
            group,
            call,
            expected,
            got: (e as Error).message || String(e),
            verdict: 'ERROR',
            cls: 'blocked',
            link: false
        };
    }
}

export const GET = function (req: Request) {
    const content = portal.getContent();
    const other = contentLib.get({key: OTHER_PATH});
    const baseUrl = siteBaseUrl();
    const targetBranch = req.branch === 'master' ? 'draft' : 'master';
    const targetBranchBaseUrl = baseUrlInBranch(content._path, targetBranch);

    const rows: Row[] = [
        row(
            REQUEST,
            'pageUrl({path})',
            'a server-relative URL ending in the path relative to the site',
            () => {
                const url = portal.pageUrl({path: content._path});
                const relative = siteRelative(content._path);
                return {
                    ok: url.indexOf('/') === 0 && url.indexOf(relative) === url.length - relative.length,
                    got: url
                };
            }
        ),
        row(
            REQUEST,
            'pageUrl({id})',
            'the same URL as the path form, for the same content',
            () => {
                const byPath = portal.pageUrl({path: content._path});
                const byId = portal.pageUrl({id: content._id});
                return {ok: byId === byPath, got: byId};
            }
        ),
        row(
            REQUEST,
            "pageUrl({path, type: 'server'})",
            'the default form, so identical to passing no type',
            () => {
                const url = portal.pageUrl({path: content._path, type: 'server'});
                return {ok: url === portal.pageUrl({path: content._path}), got: url};
            }
        ),
        row(
            REQUEST,
            "pageUrl({path, type: 'absolute'})",
            'the scheme and host of this request, even when a site base URL is set: asking for an'
                + ' absolute URL inside a request keeps the request it was asked in',
            () => {
                const url = portal.pageUrl({path: content._path, type: 'absolute'});
                return {ok: url.indexOf('http') === 0 && url.indexOf(req.host) !== -1, got: url};
            }
        ),
        row(
            REQUEST,
            'the site base URL itself',
            'the value configured in siteConfig under the reserved portal application key',
            () => ({
                ok: true,
                got: baseUrl || 'not set, so absolute URLs fall back to the request host'
            })
        ),
        row(
            REQUEST,
            "pageUrl({path}) with a site base URL set",
            'unaffected: a server-relative URL stays relative whatever the base URL says',
            () => {
                const url = portal.pageUrl({path: content._path});
                return {ok: url.indexOf('/') === 0 && url.indexOf('http') !== 0, got: url};
            }
        ),
        row(
            REQUEST,
            "pageUrl({path, type: 'websocket'})",
            'a ws or wss URL',
            () => {
                const url = portal.pageUrl({path: content._path, type: 'websocket'});
                return {ok: url.indexOf('ws://') === 0 || url.indexOf('wss://') === 0, got: url};
            }
        ),
        row(
            REQUEST,
            'pageUrl({path, params})',
            'both parameters in the query string',
            () => {
                const url = portal.pageUrl({path: content._path, params: {a: '1', b: 'two'}});
                return {ok: url.indexOf('a=1') !== -1 && url.indexOf('b=two') !== -1, got: url};
            }
        ),
        row(
            REQUEST,
            'pageUrl({path, params}) with an array value',
            'the parameter repeated once per value',
            () => {
                const url = portal.pageUrl({path: content._path, params: {b: ['1', '2']}});
                const occurrences = url.split('b=').length - 1;
                return {ok: occurrences === 2, got: url};
            }
        ),
        row(
            REQUEST,
            'pageUrl({path, params}) with a value needing escaping',
            'the space and ampersand encoded, not passed through',
            () => {
                const url = portal.pageUrl({path: content._path, params: {q: 'a b&c'}});
                return {ok: url.indexOf('a b') === -1 && url.indexOf('c') !== -1, got: url};
            }
        ),
        row(
            REQUEST,
            'pageUrl({path}) for another content',
            'a URL for that content, ending in its path relative to its own site, and not this page',
            () => {
                if (!other) {
                    return {ok: false, got: 'no content at ' + OTHER_PATH};
                }
                const url = portal.pageUrl({path: other._path});
                const relative = siteRelative(other._path);
                return {
                    ok: url.indexOf(relative) === url.length - relative.length
                        && url !== portal.pageUrl({path: content._path}),
                    got: url
                };
            }
        ),
        row(
            CROSS,
            'pageUrl({path, branch})',
            targetBranchBaseUrl
                ? 'anchored to the base URL configured in that branch, which replaces the whole'
                    + ' prefix, so the branch is no longer visible in the URL at all'
                : 'the branch named in the URL, rather than the one serving this request: naming a'
                    + ' branch resolves outside this request, so the vhost mapping is not used',
            () => {
                const url = portal.pageUrl({path: content._path, branch: targetBranch});
                return {
                    ok: targetBranchBaseUrl
                        ? url.indexOf(targetBranchBaseUrl) === 0
                        : url.indexOf('/' + targetBranch + '/') !== -1,
                    got: url + (targetBranchBaseUrl !== baseUrl
                        ? '   (' + targetBranch + ' has ' + (targetBranchBaseUrl || 'no base URL')
                            + ', this branch has ' + (baseUrl || 'none') + ')'
                        : '')
                };
            }
        ),
        row(
            CROSS,
            'pageUrl({path, project})',
            baseUrl
                ? 'anchored to the site base URL, with the path relative to the site appended: naming a'
                    + ' project resolves outside this request, so there is no request host to borrow'
                : 'the project named in the URL, since no site base URL is set',
            () => {
                const url = portal.pageUrl({path: content._path, project: 'features'});
                const site = portal.getSite();
                const relative = site ? content._path.substring(site._path.length) : content._path;

                return {
                    ok: baseUrl
                        ? url.indexOf(baseUrl) === 0 && url.indexOf(relative) === url.length - relative.length
                        : url.indexOf('/features/') !== -1,
                    got: url
                };
            }
        ),
        row(
            REQUEST,
            'pageUrl({}) with neither path nor id',
            'a URL for the content being rendered',
            () => {
                const url = portal.pageUrl({} as PageUrlParams);
                const relative = siteRelative(content._path);
                return {ok: url.indexOf(relative) === url.length - relative.length, got: url};
            }
        )
    ];

    const failed = rows.filter((one) => one.verdict !== 'pass').length;

    return {
        contentType: 'text/html',
        body: thymeleaf.render(view, {
            requestRows: rows.filter((one) => one.group === REQUEST),
            crossRows: rows.filter((one) => one.group === CROSS),
            branch: req.branch ?? '',
            baseUrl: baseUrl || 'not set',
            summary: failed === 0
                ? `All ${rows.length} calls behaved as expected`
                : `${failed} of ${rows.length} calls did not`
        })
    };
};
