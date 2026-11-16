import * as portal from '/lib/xp/portal';
import * as thymeleaf from '/lib/thymeleaf';
import type {Request} from '@enonic-types/core';

const view = resolve('apiUrl.html');

const OWN_API = 'com.enonic.app.features:sse';
const OTHER_APP_API = 'media:image';

// The same site base URL that anchors page URLs. Read here to check whether it reaches API URLs
// too: the 8.1 notes place API locations in the vhost context rather than on the site, so an API
// URL is expected to keep the request host even when a site base URL is set.
function siteBaseUrl(): string {
    const site = portal.getSite();
    const raw = site?.data?.siteConfig as unknown;
    const configs = raw ? ([] as {applicationKey?: string; config?: {baseUrl?: string}}[]).concat(raw as never) : [];

    return configs.filter((entry) => entry.applicationKey === 'portal')[0]?.config?.baseUrl ?? '';
}

interface Row {
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

function row(call: string, expected: string, fn: () => {ok: boolean; got: string; note?: string}): Row {
    try {
        const result = fn();
        return {
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
    const baseUrl = siteBaseUrl();

    const rows: Row[] = [
        row(
            'apiUrl({api}) for an API of this app',
            "a service point under the current site, so an underscore endpoint rather than /api/",
            () => {
                const url = portal.apiUrl({api: OWN_API});
                return {ok: url.indexOf('/_/' + OWN_API) !== -1, got: url};
            }
        ),
        row(
            'apiUrl({api}) for an API of another application',
            'a URL naming that application, not this one',
            () => {
                const url = portal.apiUrl({api: OTHER_APP_API});
                return {ok: url.indexOf(OTHER_APP_API) !== -1, got: url};
            }
        ),
        row(
            "apiUrl({api, type: 'server'})",
            'the default form, so identical to passing no type',
            () => {
                const url = portal.apiUrl({api: OWN_API, type: 'server'});
                return {ok: url === portal.apiUrl({api: OWN_API}), got: url};
            }
        ),
        row(
            "apiUrl({api, type: 'absolute'})",
            'a URL carrying scheme and host',
            () => {
                const url = portal.apiUrl({api: OWN_API, type: 'absolute'});
                return {ok: url.indexOf('http') === 0 && url.indexOf(req.host) !== -1, got: url};
            }
        ),
        row(
            "apiUrl({api, type: 'websocket'})",
            'a ws or wss URL, which is how the websocket demos reach their API',
            () => {
                const url = portal.apiUrl({api: OWN_API, type: 'websocket'});
                return {ok: url.indexOf('ws://') === 0 || url.indexOf('wss://') === 0, got: url};
            }
        ),
        row(
            'apiUrl({api, path}) with a string',
            'the path appended after the API segment',
            () => {
                const url = portal.apiUrl({api: OWN_API, path: '/items'});
                return {ok: url.indexOf(OWN_API) < url.indexOf('/items'), got: url};
            }
        ),
        row(
            'apiUrl({api, path}) with an array of segments',
            'the segments joined, giving the same URL as the string form',
            () => {
                const asArray = portal.apiUrl({api: OWN_API, path: ['items', '42']});
                const asString = portal.apiUrl({api: OWN_API, path: '/items/42'});
                return {ok: asArray === asString, got: asArray};
            }
        ),
        row(
            'apiUrl({api, path}) with a segment needing escaping',
            'the space encoded rather than passed through, which 8.1 changed',
            () => {
                const url = portal.apiUrl({api: OWN_API, path: ['a b']});
                return {ok: url.indexOf('a b') === -1, got: url};
            }
        ),
        row(
            'apiUrl({api, params})',
            'both parameters in the query string',
            () => {
                const url = portal.apiUrl({api: OWN_API, params: {a: '1', b: 'two'}});
                return {ok: url.indexOf('a=1') !== -1 && url.indexOf('b=two') !== -1, got: url};
            }
        ),
        row(
            "apiUrl({api, type: 'absolute'}) with a site base URL set",
            baseUrl
                ? 'the request host all the same, since API locations come from the vhost context rather than the site base URL'
                : 'not applicable until a site base URL is set, so only the request host is checked',
            () => {
                const url = portal.apiUrl({api: OWN_API, type: 'absolute'});
                return {
                    ok: url.indexOf(req.host) !== -1,
                    got: url,
                    note: baseUrl ? 'Site base URL: ' + baseUrl : ''
                };
            }
        ),
        row(
            'apiUrl({api}) for an API this site does not mount',
            'a URL all the same, since the function does not check the mount',
            () => {
                const url = portal.apiUrl({api: 'com.enonic.app.features:no-such-api'});
                return {ok: url.indexOf('no-such-api') !== -1, got: url};
            }
        )
    ];

    const failed = rows.filter((one) => one.verdict !== 'pass').length;

    return {
        contentType: 'text/html',
        body: thymeleaf.render(view, {
            rows,
            baseUrl: baseUrl || 'not set',
            summary: failed === 0
                ? `All ${rows.length} calls behaved as expected`
                : `${failed} of ${rows.length} calls did not`
        })
    };
};
