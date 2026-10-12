import {runTests} from '/lib/explicit-url-tests';
import * as thymeleaf from '/lib/thymeleaf';
import type {Request} from '@enonic-types/core';

const view = resolve('pageUrlParts.html');

export function GET(req: Request) {
    const run = runTests();
    return {
        contentType: 'text/html',
        body: thymeleaf.render(view, {
            backUrl: req.path.replace(/\/$/, '').replace(/\/[^/]*$/, '/'),
            total: run.total,
            passed: run.passed,
            failed: run.failed,
            groups: ['Main site', 'Nested site', 'Outside a site'].map((name) => ({
                name,
                rows: run.results.filter((result) => result.group === name)
            }))
        })
    };
}
