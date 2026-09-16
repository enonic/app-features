import * as authLib from '/lib/xp/auth';
import * as contentLib from '/lib/xp/content';
import {get as getContext, run} from '/lib/xp/context';
import * as thymeleaf from '/lib/thymeleaf';
import type {Request} from '@enonic-types/core';

const view = resolve('node-listing.html');

const PARENT = '/content/libraries';
const BATCH_SIZE = 5;

interface Entry {
    id: string;
    path: string;
    timestamp?: string;
    versionId?: string;
}

interface ListResult {
    entries: Entry[];
    total: number;
}

interface EnumerateResult {
    entries: Entry[];
    remaining: number;
    cursor: string | null;
}

interface NodeListingBean {
    list(parentPath: string, limit: number): string;

    enumerate(parentPath: string, batchSize: number, cursor: string | null): string;
}

// NodeService list and enumerate are Java-only: lib-node has no equivalent, so they are reached
// through a script bean. Both return JSON, so the shape does not depend on engine conversion.
function bean(): NodeListingBean {
    return __.newBean<NodeListingBean>('com.enonic.xp.sample.features.NodeListing');
}

interface Check {
    label: string;
    expected: string;
    actual: string;
    verdict: string;
    cls: string;
}

function check(label: string, expected: string, fn: () => {ok: boolean; actual: string}): Check {
    try {
        const result = fn();
        return {
            label,
            expected,
            actual: result.actual,
            verdict: result.ok ? 'pass' : 'FAIL',
            cls: result.ok ? 'ok' : 'blocked'
        };
    } catch (e) {
        return {label, expected, actual: (e as Error).message || String(e), verdict: 'ERROR', cls: 'blocked'};
    }
}

function inPathOrder(entries: Entry[]): boolean {
    for (let i = 1; i < entries.length; i++) {
        if (entries[i - 1].path > entries[i].path) {
            return false;
        }
    }
    return true;
}

// The two methods differ on access. `list` sets a required permission on its query and returns only
// entries the caller may read. `enumerate` calls requireAdminRole and then queries without one, so
// it returns every entry in the subtree: unfiltered, and therefore admin only. The suite runs both
// with the role so the traversal can be compared, and checks each method's access separately.
function asAdmin<T>(fn: () => T): T {
    return run({principals: ['role:system.admin']}, fn);
}

export const GET = function (_req: Request) {
    const isAdmin = authLib.hasRole('role:system.admin');

    let listed: ListResult = {entries: [], total: 0};
    let listError: string | null = null;
    try {
        listed = asAdmin(() => JSON.parse(bean().list(PARENT, 200)) as ListResult);
    } catch (e) {
        listError = (e as Error).message || String(e);
    }

    // Walk every batch, so the cursor is exercised rather than just the first page.
    const pages: EnumerateResult[] = [];
    let enumerateError: string | null = null;
    try {
        let cursor: string | null = null;
        for (let guard = 0; guard < 50; guard++) {
            const page = asAdmin(() => JSON.parse(bean().enumerate(PARENT, BATCH_SIZE, cursor)) as EnumerateResult);
            pages.push(page);
            cursor = page.cursor;
            if (!cursor || page.entries.length === 0) {
                break;
            }
        }
    } catch (e) {
        enumerateError = (e as Error).message || String(e);
    }

    let callerEnumerate: string;
    try {
        JSON.parse(bean().enumerate(PARENT, 1, null));
        callerEnumerate = 'permitted';
    } catch (e) {
        callerEnumerate = (e as Error).message || String(e);
    }

    let callerList: string;
    try {
        const asCaller = JSON.parse(bean().list(PARENT, 200)) as ListResult;
        callerList = `permitted, ${asCaller.total} entries readable`;
    } catch (e) {
        callerList = (e as Error).message || String(e);
    }

    const enumerated = pages.reduce((all: Entry[], page) => all.concat(page.entries), []);
    const subtreeQuery = contentLib.query({parent: '/libraries', recursive: true, count: -1, returns: 'ids'});

    const checks: Check[] = [
        check(
            'enumerate requires the admin role',
            isAdmin
                ? 'permitted, since the current user is an administrator'
                : 'denied for the current user, which is what requireAdminRole enforces',
            () => ({
                ok: isAdmin ? callerEnumerate === 'permitted' : callerEnumerate !== 'permitted',
                actual: callerEnumerate
            })
        ),
        check(
            'list needs no role, and filters by read access instead',
            'permitted for the current user, returning only readable entries',
            () => ({
                ok: callerList.indexOf('permitted') === 0,
                actual: callerList
            })
        ),
        check(
            'list streams the whole subtree beneath the parent',
            'more than one entry, covering children and their descendants',
            () => ({
                ok: !listError && listed.total > 1,
                actual: listError ?? `${listed.total} entries, ${listed.entries.length} rendered`
            })
        ),
        check(
            'list returns entries in path order',
            'each path not less than the one before it',
            () => ({
                ok: inPathOrder(listed.entries),
                actual: listed.entries.length === 0
                    ? 'no entries'
                    : `first ${listed.entries[0].path}, last ${listed.entries[listed.entries.length - 1].path}`
            })
        ),
        check(
            'enumerate returns the same entries as list',
            'the same count from both methods',
            () => ({
                ok: !enumerateError && enumerated.length === listed.total,
                actual: enumerateError ?? `list ${listed.total}, enumerate ${enumerated.length} over ${pages.length} batch(es)`
            })
        ),
        check(
            'enumerate honours its batch size',
            `no batch larger than ${BATCH_SIZE}`,
            () => ({
                ok: pages.every((page) => page.entries.length <= BATCH_SIZE),
                actual: 'batch sizes: ' + pages.map((page) => page.entries.length).join(', ')
            })
        ),
        check(
            'enumerate reports a cursor while entries remain',
            'a cursor on every batch but the last, and none at the end',
            () => {
                const last = pages[pages.length - 1];
                const earlier = pages.slice(0, -1);
                return {
                    ok: earlier.every((page) => !!page.cursor) && !last.cursor,
                    actual: `cursors: ${pages.map((page) => (page.cursor ? 'yes' : 'no')).join(', ')}, remaining on last: ${last.remaining}`
                };
            }
        ),
        check(
            'enumerate carries a version id, which list does not',
            'a versionId on an enumerated entry and none on a listed one',
            () => ({
                ok: !!enumerated[0]?.versionId && !listed.entries[0]?.versionId,
                actual: `enumerate ${enumerated[0]?.versionId ?? 'none'}, list ${listed.entries[0]?.versionId ?? 'none'}`
            })
        ),
        check(
            'the subtree matches what a recursive query finds',
            'the same number of contents, ignoring the parent itself',
            () => ({
                ok: listed.total === subtreeQuery.total,
                actual: `list ${listed.total}, recursive query ${subtreeQuery.total}`
            })
        )
    ];

    const failed = checks.filter((one) => one.verdict !== 'pass').length;

    return {
        contentType: 'text/html',
        body: thymeleaf.render(view, {
            checks,
            entries: listed.entries.slice(0, 20),
            hasEntries: listed.entries.length !== 0,
            batchSizes: pages.map((page) => page.entries.length).join(', '),
            parent: PARENT,
            isAdmin,
            callerEnumerate,
            callerList,
            batchSize: BATCH_SIZE,
            repository: getContext().repository,
            branch: getContext().branch,
            summary: failed === 0
                ? `All ${checks.length} checks passed`
                : `${failed} of ${checks.length} checks did not pass`
        })
    };
};
