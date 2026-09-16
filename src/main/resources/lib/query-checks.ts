import * as contentLib from '/lib/xp/content';
import * as nodeLib from '/lib/xp/node';
import {get as getContext} from '/lib/xp/context';

// The XP 8.1 query parameters, checked per library. The two are close but not interchangeable, so
// each library's page carries its own checks rather than sharing a page.

export const DIRECT_PARENT = '/libraries';
export const DEEP_PARENT = '/features';

export interface Check {
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

// A hit carries `_id` when the query returns whole contents, and `id` when it returns ids or
// fields, so both shapes are accepted here.
function ids(hits: {id?: string; _id?: string}[]): string[] {
    return hits.map((hit) => hit.id ?? hit._id ?? '').sort();
}

function sameMembers(a: string[], b: string[]): boolean {
    return a.length === b.length && a.every((value, index) => value === b[index]);
}

export function contentQueryChecks(): Check[] {
    return [
        check(
            'query with parent replaces the deprecated getChildren',
            'the same content ids from both calls',
            () => {
                const deprecated = contentLib.getChildren({key: DIRECT_PARENT, count: -1});
                const replacement = contentLib.query({parent: DIRECT_PARENT, count: -1});
                const a = ids(deprecated.hits);
                const b = ids(replacement.hits);
                return {
                    ok: a.length !== 0 && sameMembers(a, b),
                    actual: `getChildren ${a.length} hits, query ${b.length} hits`
                };
            }
        ),
        check(
            'parent alone restricts the query to direct children',
            `only children of ${DEEP_PARENT}, fewer than its whole subtree`,
            () => {
                const direct = contentLib.query({parent: DEEP_PARENT, count: -1});
                const subtree = contentLib.query({parent: DEEP_PARENT, recursive: true, count: -1});
                return {
                    ok: direct.total > 0 && subtree.total > direct.total,
                    actual: `${direct.total} direct, ${subtree.total} in the subtree`
                };
            }
        ),
        check(
            "returns 'ids' answers without reading the contents",
            'hits carrying an id and a score, and no content body',
            () => {
                const result = contentLib.query({parent: DIRECT_PARENT, count: 1, returns: 'ids'});
                const hit = result.hits[0] as unknown as Record<string, unknown>;
                return {
                    ok: !!hit && !!hit.id && hit.data === undefined && hit.displayName === undefined,
                    actual: hit ? 'hit keys: ' + Object.keys(hit).join(', ') : 'no hits'
                };
            }
        ),
        check(
            'returns with a field list puts those fields on each hit',
            'a fields object holding displayName and _path',
            () => {
                const result = contentLib.query({
                    parent: DIRECT_PARENT,
                    count: 1,
                    returns: ['displayName', '_path']
                });
                const hit = result.hits[0] as unknown as {fields?: Record<string, string>};
                const fields = hit?.fields;
                return {
                    ok: !!fields && !!fields.displayName && !!fields._path,
                    actual: fields ? JSON.stringify(fields) : 'no fields on the hit'
                };
            }
        ),
        check(
            'the default still returns whole contents',
            'a hit carrying displayName and data',
            () => {
                const result = contentLib.query({parent: DIRECT_PARENT, count: 1});
                const hit = result.hits[0];
                return {
                    ok: !!hit && !!hit.displayName && hit.data !== undefined,
                    actual: hit
                        ? `displayName ${hit.displayName}, data present ${hit.data !== undefined}`
                        : 'no hits'
                };
            }
        )
    ];
}

export function nodeQueryChecks(): Check[] {
    const parent = '/content' + DIRECT_PARENT;

    function connection() {
        return nodeLib.connect({
            repoId: getContext().repository as string,
            branch: getContext().branch as string
        });
    }

    return [
        check(
            'query with parent replaces the deprecated findChildren',
            'the same node ids from both calls',
            () => {
                const repo = connection();
                const deprecated = repo.findChildren({parentKey: parent, count: -1});
                const replacement = repo.query({parent, count: -1});
                const a = ids(deprecated.hits as {id: string}[]);
                const b = ids(replacement.hits as {id: string}[]);
                return {
                    ok: a.length !== 0 && sameMembers(a, b),
                    actual: `findChildren ${a.length} hits, query ${b.length} hits`
                };
            }
        ),
        check(
            'recursive extends the query to the whole subtree',
            'more hits than the direct children alone',
            () => {
                const repo = connection();
                const direct = repo.query({parent: '/content' + DEEP_PARENT, count: -1});
                const subtree = repo.query({parent: '/content' + DEEP_PARENT, recursive: true, count: -1});
                return {
                    ok: direct.total > 0 && subtree.total > direct.total,
                    actual: `${direct.total} direct, ${subtree.total} in the subtree`
                };
            }
        ),
        check(
            'returns puts index fields on each hit',
            'a fields object holding _name',
            () => {
                const repo = connection();
                const result = repo.query({parent, count: 1, returns: ['_name']});
                const hit = result.hits[0] as unknown as {fields?: Record<string, string>};
                return {
                    ok: !!hit?.fields && !!hit.fields._name,
                    actual: hit?.fields ? JSON.stringify(hit.fields) : 'no fields on the hit'
                };
            }
        )
    ];
}
