import * as contentLib from '/lib/xp/content';
import * as portal from '/lib/xp/portal';
import * as thymeleaf from '/lib/thymeleaf';
import type {Request} from '@enonic-types/core';
import type {PageUrlParams} from '@enonic-types/lib-portal';

const view = resolve('pageUrl.html');

const OTHER_PATH = '/features/request-steering';

const REQUEST = 'Request-relative';

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

interface Row {
    group: string;
    call: string;
    expected: string;
    got: string;
    note?: string;
    verdict: string;
    cls: string;
    link: boolean;
}

// A result is offered as a link when a browser can follow it. A ws:// URL is a real result but not
// navigable, and an error message is not a URL at all, so both stay as text.
function navigable(value: string): boolean {
    return value.indexOf('/') === 0 || value.indexOf('http://') === 0 || value.indexOf('https://') === 0;
}

function queryValues(url: string, key: string): string[] {
    const query = url.split('#')[0].split('?')[1] ?? '';
    return query.split('&')
        .filter((param) => decodeURIComponent(param.split('=')[0].replace(/\+/g, ' ')) === key)
        .map((param) => decodeURIComponent(param.substring(param.indexOf('=') + 1).replace(/\+/g, ' ')));
}

function sameUrl(params: PageUrlParams, reference: PageUrlParams): {ok: boolean; got: string} {
    const url = portal.pageUrl(params);
    return {ok: url.indexOf('/_/error/') === -1 && url === portal.pageUrl(reference), got: url};
}

function row(group: string, call: string, expected: string, fn: () => {ok: boolean; got: string; note?: string}): Row {
    try {
        const result = fn();
        return {
            group,
            call,
            expected,
            got: result.got,
            note: result.note ?? '',
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
    const currentBranch = req.branch ?? 'draft';
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
                const values = queryValues(url, 'q');
                return {ok: values.length === 1 && values[0] === 'a b&c' && url.indexOf(' ') === -1, got: url};
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

    // Keep path/id pairs next to their concrete options so the page demonstrates both forms.
    for (const type of ['absolute', 'websocket'] as const) {
        rows.push(row(
            REQUEST,
            `pageUrl({id, type: '${type}'})`,
            'the same URL as selecting this content by path with the same type',
            () => sameUrl({id: content._id, type}, {path: content._path, type})
        ));
    }

    rows.push(
        row(
            REQUEST,
            "pageUrl({id, params: {tag: ['news', 'events']}})",
            'the ID selects this page and each tag becomes a separate query parameter',
            () => {
                const url = portal.pageUrl({id: content._id, params: {tag: ['news', 'events']}});
                const values = queryValues(url, 'tag');
                return {ok: values.length === 2 && values[0] === 'news' && values[1] === 'events', got: url};
            }
        ),
        row(
            REQUEST,
            "pageUrl({path, params: {q: 'Tromsø + café'}})",
            'Unicode, spaces and a literal plus sign survive query encoding and decoding',
            () => {
                const url = portal.pageUrl({path: content._path, params: {q: 'Tromsø + café'}});
                const values = queryValues(url, 'q');
                return {ok: values.length === 1 && values[0] === 'Tromsø + café' && url.indexOf(' ') === -1, got: url};
            }
        ),
        row(
            REQUEST,
            'pageUrl({path, params: {}})',
            'an empty parameter object leaves the URL unchanged',
            () => sameUrl({path: content._path, params: {}}, {path: content._path})
        )
    );

    const failed = rows.filter((one) => one.verdict !== 'pass').length;

    return {
        contentType: 'text/html',
        body: thymeleaf.render(view, {
            requestRows: rows.filter((one) => one.group === REQUEST),
            branch: currentBranch,
            explicitTestsUrl: '/site/features/draft/libraries/explicit-url',
            path: content._path,
            id: content._id,
            baseUrl: baseUrl || 'not set',
            summary: failed === 0
                ? `All ${rows.length} calls behaved as expected`
                : `${failed} of ${rows.length} calls did not`
        })
    };
};
