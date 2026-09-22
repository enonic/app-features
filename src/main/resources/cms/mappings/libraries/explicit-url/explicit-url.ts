import {runTests} from '/lib/explicit-url-tests';
import * as thymeleaf from '/lib/thymeleaf';

const view = resolve('explicit-url.html');

export function GET() {
    const run = runTests();
    return {
        contentType: 'text/html',
        body: thymeleaf.render(view, {
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
