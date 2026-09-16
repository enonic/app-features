import * as thymeleaf from '/lib/thymeleaf';
import {assetUrl} from '/lib/enonic/asset';
import {runOperation, suites} from '/lib/library-suites';
import {contentQueryChecks} from '/lib/query-checks';
import type {Request} from '@enonic-types/core';

const view = resolve('content.html');

const SUITE = 'content';

function firstValue(value: string | string[] | undefined): string | undefined {
    return Array.isArray(value) ? value[0] : value;
}

export const GET = function (req: Request) {
    // The query checks read published content, so they run on every render. The suite writes and
    // publishes content, needs the draft branch and an administrator, and is asked for separately.
    const checks = contentQueryChecks();
    const failedChecks = checks.filter((one) => one.verdict !== 'pass').length;

    const wanted = firstValue(req.params.results) === 'json';
    const results = wanted ? suites[SUITE].operations.map(runOperation) : [];
    const failed = results.filter((result) => !result.ok).length;

    if (wanted) {
        return {
            contentType: 'application/json',
            body: JSON.stringify({
                results,
                failed,
                total: results.length,
                summary: failed === 0
                    ? 'All ' + results.length + ' operations succeeded'
                    : failed + ' of ' + results.length + ' operations failed'
            })
        };
    }

    return {
        contentType: 'text/html',
        body: thymeleaf.render(view, {
            checks,
            checkSummary: failedChecks === 0
                ? `All ${checks.length} query checks passed`
                : `${failedChecks} of ${checks.length} query checks did not pass`,
            operationCount: suites[SUITE].operations.length,
            // Built server-side: in a Content Studio preview the browser URL is the admin preview
            // address, not this mapping's path, so window.location is the wrong base to fetch from.
            selfUrl: req.path,
            // An external asset, not an inline script: the admin endpoint that serves Content
            // Studio's preview sets script-src 'self', which blocks inline scripts outright.
            scriptUrl: assetUrl({path: 'js/pages/libraries/library-suite.js'})
        })
    };
};
