import * as taskLib from '/lib/xp/task';
import * as thymeleaf from '/lib/thymeleaf';
import {assetUrl} from '/lib/enonic/asset';
import {runOperation, suites} from '/lib/library-suites';
import type {Request} from '@enonic-types/core';

const view = resolve('node.html');

const SUITE = 'node';
const TASK = app.name + ':library-probe';

function firstValue(value: string | string[] | undefined): string | undefined {
    return Array.isArray(value) ? value[0] : value;
}

function json(body: unknown, status = 200) {
    return {
        status,
        contentType: 'application/json',
        body: JSON.stringify(body)
    };
}

// Submitting the suite as a named task is also how a task is meant to be started since 8.1:
// executeFunction is deprecated and unsupported on GraalJS.
export const POST = function (_req: Request) {
    try {
        return json({taskId: taskLib.submitTask({descriptor: TASK, config: {suite: SUITE}})});
    } catch (e) {
        return json({error: (e as Error).message || String(e)});
    }
};

export const GET = function (req: Request) {
    const taskId = firstValue(req.params.taskId);

    // The page polls the running task through the same path.
    if (taskId) {
        const task = taskLib.get(taskId);
        return task
            ? json({
                id: task.id,
                state: task.state,
                info: task.progress?.info ?? '',
                current: task.progress?.current ?? 0,
                total: task.progress?.total ?? 0
            })
            : json({error: 'No task ' + taskId + '. Finished tasks leave the list.'}, 404);
    }

    // Running the suite inline holds the response until every operation has finished, which leaves
    // Content Studio showing a spinner for the whole time. So it happens only when asked for, and
    // the page itself renders straight away.
    if (firstValue(req.params.results) === 'json') {
        const results = suites[SUITE].operations.map(runOperation);
        const failed = results.filter((result) => !result.ok).length;

        return json({
            results,
            failed,
            total: results.length,
            summary: failed === 0
                ? 'All ' + results.length + ' operations succeeded'
                : failed + ' of ' + results.length + ' operations failed'
        });
    }

    return {
        contentType: 'text/html',
        body: thymeleaf.render(view, {
            operationCount: suites[SUITE].operations.length,
            scriptUrl: assetUrl({path: 'js/pages/libraries/library-suite.js'})
        })
    };
};
