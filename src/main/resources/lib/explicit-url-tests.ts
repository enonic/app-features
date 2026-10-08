import {run as runInContext} from '/lib/xp/context';
import type {ScriptValue} from '@enonic-types/core';
import type {PageUrlParams} from '@enonic-types/lib-portal';

export type ExplicitPageUrlParams = Omit<PageUrlParams, 'type'> & {project: string; base?: {id: string} | {path: string}};

export interface TestCase {
    group: string;
    label: string;
    params: ExplicitPageUrlParams;
    expected: string | null;
    expectedError?: boolean;
}

export interface TestResult {
    group: string;
    label: string;
    call: string;
    expected: string | null;
    expectedError: boolean;
    actual: string | null;
    verdict: 'OK' | 'FAIL';
    error: boolean;
    link: boolean;
}

interface ExplicitPageUrlBean {
    pageUrl(params: ScriptValue): string | null;
}

type UrlInvoker = (params: ExplicitPageUrlParams) => string | null;

// Fixed baseline for the features sandbox. Edit individual cases to change the specification.
// Do not derive inputs or expected values from the request, content, site configuration or URL API.
// An explicit base selects a relative path, prefixed by its configured site base URL if present.
// Calls without an explicit base use the full content path, without a project or branch prefix.
// A target outside the explicit base's subtree is expected to throw the specified error.
// Every case passes the project explicitly. Site configuration is selected from the target project and branch.
// Assumes both target pages exist on draft and master, /features has base URL
// https://example.com/demo on both branches, and /features/subsite has https://subsite.com on both branches.
// /unbased and /unbased/subsite have no base URL or site apps; /libraries is a folder outside any site.
// Their folder targets and /libraries/explicit-url exist on both branches.
export const testCases: readonly TestCase[] = [
    {
        "group": "Main site",
        "label": "Path and master branch",
        "params": {
            "path": "/features/portal-functions/pageurl",
            "project": "features",
            "branch": "master"
        },
        "expected": "/features/portal-functions/pageurl"
    },
    {
        "group": "Main site",
        "label": "Path and master branch, nearest site selected explicitly",
        "params": {
            "path": "/features/portal-functions/pageurl",
            "project": "features",
            "branch": "master",
            "base": {
                "path": "/features"
            }
        },
        "expected": "https://example.com/demo/portal-functions/pageurl"
    },
    {
        "group": "Main site",
        "label": "Path, draft execution context",
        "params": {
            "path": "/features/portal-functions/pageurl",
            "project": "features"
        },
        "expected": "/features/portal-functions/pageurl"
    },
    {
        "group": "Main site",
        "label": "Path and draft branch",
        "params": {
            "path": "/features/portal-functions/pageurl",
            "project": "features",
            "branch": "draft"
        },
        "expected": "/features/portal-functions/pageurl"
    },
    {
        "group": "Main site",
        "label": "ID and draft branch",
        "params": {
            "id": "e1c4a9d7-3b52-4f08-9a61-7d2c8e5b40f3",
            "project": "features",
            "branch": "draft"
        },
        "expected": "/features/portal-functions/pageurl"
    },
    {
        "group": "Main site",
        "label": "ID and master branch",
        "params": {
            "id": "e1c4a9d7-3b52-4f08-9a61-7d2c8e5b40f3",
            "project": "features",
            "branch": "master"
        },
        "expected": "/features/portal-functions/pageurl"
    },
    {
        "group": "Main site",
        "label": "ID, draft execution context",
        "params": {
            "id": "e1c4a9d7-3b52-4f08-9a61-7d2c8e5b40f3",
            "project": "features"
        },
        "expected": "/features/portal-functions/pageurl"
    },
    {
        "group": "Main site",
        "label": "Encoded query value",
        "params": {
            "path": "/features/portal-functions/pageurl",
            "project": "features",
            "branch": "draft",
            "params": {
                "q": "a b&c"
            }
        },
        "expected": "/features/portal-functions/pageurl?q=a%20b%26c"
    },
    {
        "group": "Main site",
        "label": "Unbased site: no explicit base",
        "params": {
            "path": "/unbased/folder",
            "project": "features",
            "branch": "master"
        },
        "expected": "/unbased/folder"
    },
    {
        "group": "Main site",
        "label": "Unbased site: explicit site base without baseUrl",
        "params": {
            "path": "/unbased/folder",
            "project": "features",
            "branch": "master",
            "base": {
                "path": "/unbased"
            }
        },
        "expected": "/folder"
    },
    {
        "group": "Main site",
        "label": "Out-of-scope target: another site selected as base",
        "params": {
            "path": "/unbased/folder",
            "project": "features",
            "branch": "master",
            "base": {
                "path": "/features"
            }
        },
        "expected": "Content [/unbased/folder] is not inside [/features]",
        "expectedError": true
    },
    {
        "group": "Nested site",
        "label": "Path and master branch",
        "params": {
            "path": "/features/subsite/pageurl",
            "project": "features",
            "branch": "master"
        },
        "expected": "/features/subsite/pageurl"
    },
    {
        "group": "Nested site",
        "label": "Path and master branch, nearest site selected explicitly",
        "params": {
            "path": "/features/subsite/pageurl",
            "project": "features",
            "branch": "master",
            "base": {
                "path": "/features/subsite"
            }
        },
        "expected": "https://subsite.com/pageurl"
    },
    {
        "group": "Nested site",
        "label": "Path and master branch, /features selected explicitly",
        "params": {
            "path": "/features/subsite/pageurl",
            "project": "features",
            "branch": "master",
            "base": {
                "path": "/features"
            }
        },
        "expected": "https://example.com/demo/subsite/pageurl"
    },
    {
        "group": "Nested site",
        "label": "Path, draft execution context",
        "params": {
            "path": "/features/subsite/pageurl",
            "project": "features"
        },
        "expected": "/features/subsite/pageurl"
    },
    {
        "group": "Nested site",
        "label": "Path and draft branch",
        "params": {
            "path": "/features/subsite/pageurl",
            "project": "features",
            "branch": "draft"
        },
        "expected": "/features/subsite/pageurl"
    },
    {
        "group": "Nested site",
        "label": "ID and draft branch",
        "params": {
            "id": "b0238199-23ab-4451-9ad4-6cb9f1575387",
            "project": "features",
            "branch": "draft"
        },
        "expected": "/features/subsite/pageurl"
    },
    {
        "group": "Nested site",
        "label": "ID and master branch",
        "params": {
            "id": "b0238199-23ab-4451-9ad4-6cb9f1575387",
            "project": "features",
            "branch": "master"
        },
        "expected": "/features/subsite/pageurl"
    },
    {
        "group": "Nested site",
        "label": "ID, draft execution context",
        "params": {
            "id": "b0238199-23ab-4451-9ad4-6cb9f1575387",
            "project": "features"
        },
        "expected": "/features/subsite/pageurl"
    },
    {
        "group": "Nested site",
        "label": "Encoded query value",
        "params": {
            "path": "/features/subsite/pageurl",
            "project": "features",
            "branch": "draft",
            "params": {
                "q": "a b&c"
            }
        },
        "expected": "/features/subsite/pageurl?q=a%20b%26c"
    },
    {
        "group": "Nested site",
        "label": "Unbased subsite: no explicit base",
        "params": {
            "path": "/unbased/subsite/folder",
            "project": "features",
            "branch": "master"
        },
        "expected": "/unbased/subsite/folder"
    },
    {
        "group": "Nested site",
        "label": "Unbased subsite: explicit subsite base without baseUrl",
        "params": {
            "path": "/unbased/subsite/folder",
            "project": "features",
            "branch": "master",
            "base": {
                "path": "/unbased/subsite"
            }
        },
        "expected": "/folder"
    },
    {
        "group": "Nested site",
        "label": "Unbased subsite: explicit parent site base without baseUrl",
        "params": {
            "path": "/unbased/subsite/folder",
            "project": "features",
            "branch": "master",
            "base": {
                "path": "/unbased"
            }
        },
        "expected": "/subsite/folder"
    },
    {
        "group": "Outside a site",
        "label": "Content outside a site: draft without base",
        "params": {
            "path": "/libraries/explicit-url",
            "project": "features",
            "branch": "draft"
        },
        "expected": "/libraries/explicit-url"
    },
    {
        "group": "Outside a site",
        "label": "Content outside a site: master without base",
        "params": {
            "path": "/libraries/explicit-url",
            "project": "features",
            "branch": "master"
        },
        "expected": "/libraries/explicit-url"
    },
    {
        "group": "Outside a site",
        "label": "Content outside a site: explicit folder base",
        "params": {
            "path": "/libraries/explicit-url",
            "project": "features",
            "branch": "master",
            "base": {
                "path": "/libraries"
            }
        },
        "expected": "/explicit-url"
    }
];

function javaPageUrl(params: ExplicitPageUrlParams): string | null {
    return __.newBean<ExplicitPageUrlBean>('com.enonic.xp.sample.features.ExplicitPageUrl')
        .pageUrl(__.toScriptValue(params));
}

function formatCall(params: ExplicitPageUrlParams): string {
    const scope = {
        project: params.project,
        branch: params.branch,
        key: params.base && ('id' in params.base ? params.base.id : params.base.path)
    };
    const target = params.id ? 'id: ' + JSON.stringify(params.id) : 'path: ' + JSON.stringify(params.path);
    return 'portalScope(' + JSON.stringify(scope, null, 2) + ');\n\n' + target;
}

function comparable(url: string | null): string | null {
    if (url === null) {
        return null;
    }
    // Preserve the existing allowance for the two equivalent encodings of a query space.
    const offset = url.indexOf('?');
    return offset < 0 ? url : url.substring(0, offset) + url.substring(offset).replace(/\+/g, '%20');
}

export function runTests(invoke: UrlInvoker = javaPageUrl) {
    const results: TestResult[] = testCases.map((test) => {
        let actual: string | null;
        let error = false;
        try {
            // Cases without an explicit branch must see the same draft context on every test page.
            actual = runInContext({repository: 'com.enonic.cms.features', branch: 'draft'}, () => invoke(test.params));
        } catch (e) {
            actual = (e as Error).message || String(e);
            error = true;
        }
        return {
            group: test.group,
            label: test.label,
            call: formatCall(test.params),
            expected: test.expected,
            expectedError: !!test.expectedError,
            actual,
            verdict: (test.expectedError
                ? error && actual === test.expected
                : !error && comparable(actual) === comparable(test.expected)) ? 'OK' : 'FAIL',
            error,
            link: !error && typeof actual === 'string' && /^(https?:\/\/|\/)/.test(actual)
        };
    });
    const failed = results.filter((result) => result.verdict === 'FAIL').length;
    return {results, total: results.length, passed: results.length - failed, failed};
}
