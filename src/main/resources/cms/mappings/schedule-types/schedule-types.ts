import * as portal from '/lib/xp/portal';
import * as scheduler from '/lib/xp/scheduler';
import * as taskLib from '/lib/xp/task';
import * as thymeleaf from '/lib/thymeleaf';
import {assetUrl} from '/lib/enonic/asset';
import type {Request} from '@enonic-types/core';
import type {ScheduledJob} from '@enonic-types/lib-scheduler';

const view = resolve('schedule-types.html');

const ONE_TIME_JOB = 'features-one-time-probe';
const FIXED_RATE_JOB = 'features-fixed-rate-probe';
const SLOW_JOB = 'features-slow-fixed-rate-probe';
const PROBE_DESCRIPTOR = app.name + ':schedule-probe';

const OURS = [ONE_TIME_JOB, FIXED_RATE_JOB, SLOW_JOB];

function firstValue(value: string | string[] | undefined): string | undefined {
    return Array.isArray(value) ? value[0] : value;
}

function jobs(): ScheduledJob[] {
    return scheduler.list().filter((job) => OURS.indexOf(job.name) !== -1);
}

function job(name: string): ScheduledJob | null {
    return jobs().filter((candidate) => candidate.name === name)[0] ?? null;
}

function probeTasks(): ReturnType<typeof taskLib.list> {
    return taskLib.list().filter((task) => task.description.indexOf('scheduled task receives') !== -1
        || task.name === PROBE_DESCRIPTOR);
}

function remove(name: string): void {
    if (job(name)) {
        scheduler.delete({name});
    }
}

function createOneTime(): void {
    remove(ONE_TIME_JOB);
    // Fires a few seconds from now, then removes itself. XP 8.1: deleteAfterRun on a ONE_TIME
    // schedule deletes the job once its task has been submitted.
    scheduler.create({
        name: ONE_TIME_JOB,
        description: 'One-time job that deletes itself once it has fired',
        descriptor: PROBE_DESCRIPTOR,
        enabled: true,
        config: {sleepMs: 0},
        schedule: {
            type: 'ONE_TIME',
            value: new Date(Date.now() + 5000).toISOString(),
            deleteAfterRun: true
        }
    });
}

function createFixedRate(): void {
    remove(FIXED_RATE_JOB);
    // XP 8.1: FIXED_RATE takes an ISO-8601 duration, measured between the starts of two runs.
    scheduler.create({
        name: FIXED_RATE_JOB,
        description: 'Fixed-rate job running every 30 seconds',
        descriptor: PROBE_DESCRIPTOR,
        enabled: true,
        config: {sleepMs: 0},
        schedule: {
            type: 'FIXED_RATE',
            value: 'PT30S'
        }
    });
}

function createSlow(): void {
    remove(SLOW_JOB);
    // Lingers longer than its own interval, so the next run has to wait rather than overlap.
    scheduler.create({
        name: SLOW_JOB,
        description: 'Fixed-rate job that lingers longer than its interval',
        descriptor: PROBE_DESCRIPTOR,
        enabled: true,
        config: {sleepMs: 20000},
        schedule: {
            type: 'FIXED_RATE',
            value: 'PT10S'
        }
    });
}

export const POST = function (req: Request) {
    const operation = firstValue(req.params.operation);

    // Managing scheduled jobs needs an administrator. Report that rather than failing the request,
    // so the page can say what is wrong instead of showing an error page.
    try {
        if (operation === 'one-time') {
            createOneTime();
        } else if (operation === 'fixed-rate') {
            createFixedRate();
        } else if (operation === 'slow') {
            createSlow();
        } else if (operation === 'clear') {
            OURS.forEach(remove);
        }
    } catch (e) {
        return {
            contentType: 'application/json',
            body: JSON.stringify({
                operation,
                jobs: [],
                error: (e as Error).message || String(e)
            })
        };
    }

    return {
        contentType: 'application/json',
        body: JSON.stringify({operation, jobs: jobs().map((j) => j.name)})
    };
};

export const GET = function (req: Request) {
    // A mapping controller runs on a path, with or without a content item behind it. Nothing here
    // needs content, so the title falls back to a constant when the path holds none.
    const content = portal.getContent();
    const ourJobs = jobs();
    const tasks = probeTasks();

    const fixedRate = job(FIXED_RATE_JOB);
    const slow = job(SLOW_JOB);
    const oneTime = job(ONE_TIME_JOB);

    const running = tasks.filter((task) => task.state === 'RUNNING');
    const withLastTaskId = tasks.filter((task) => (task.progress?.info ?? '').indexOf('lastTaskId=') === 0
        && (task.progress?.info ?? '').indexOf('lastTaskId=none') !== 0);

    const anyProbeRan = tasks.length !== 0 || ourJobs.some((j) => !!j.lastTaskId);

    const checks = [
        {
            label: 'FIXED_RATE is accepted with an ISO-8601 duration',
            expected: "a job of type FIXED_RATE with value 'PT30S'",
            actual: fixedRate
                ? `${fixedRate.schedule.type} ${fixedRate.schedule.value}`
                : 'no fixed-rate job yet, create it above',
            state: fixedRate ? (fixedRate.schedule.type === 'FIXED_RATE' ? 'pass' : 'fail') : 'waiting'
        },
        {
            label: 'ONE_TIME is accepted with deleteAfterRun',
            expected: 'a job of type ONE_TIME, until it fires',
            actual: oneTime
                ? `${oneTime.schedule.type} ${oneTime.schedule.value}`
                : 'no one-time job right now, which is also what a fired job looks like',
            state: oneTime ? (oneTime.schedule.type === 'ONE_TIME' ? 'pass' : 'fail') : 'waiting'
        },
        {
            label: 'The one-time job deleted itself after firing',
            expected: 'the job gone, with a probe task recorded from its run',
            actual: oneTime
                ? 'the job is still waiting to fire'
                : (anyProbeRan
                    ? 'the job is gone and a probe run was recorded'
                    : 'nothing has run yet, create the one-time job and wait five seconds'),
            state: oneTime ? 'waiting' : (anyProbeRan ? 'pass' : 'waiting')
        },
        {
            label: 'A scheduled task reads its job\'s previous task id',
            expected: 'a probe task reporting schedule.lastTaskId from the context',
            actual: withLastTaskId.length !== 0
                ? withLastTaskId[0].progress?.info ?? ''
                : (tasks.length !== 0
                    ? 'only first runs so far, every one reported lastTaskId=none'
                    : 'no probe task in the list, create a fixed-rate job and wait for its second run'),
            state: withLastTaskId.length !== 0 ? 'pass' : 'waiting'
        },
        {
            label: 'Runs of one job do not overlap',
            expected: 'at most one probe task running at a time',
            actual: `${running.length} probe task(s) running now`,
            state: slow
                ? (running.length <= 1 ? 'pass' : 'fail')
                : 'waiting'
        }
    ];

    // The verdict class and label are decided here rather than in the view: this Thymeleaf setup
    // takes a single expression per attribute, and a nested ternary in the template is fragile.
    const renderedChecks = checks.map((check) => ({
        label: check.label,
        expected: check.expected,
        actual: check.actual,
        verdictClass: check.state === 'pass' ? 'ok' : (check.state === 'fail' ? 'blocked' : 'waiting'),
        verdictText: check.state === 'pass' ? 'pass' : (check.state === 'fail' ? 'FAIL' : 'not yet')
    }));

    return {
        contentType: 'text/html',
        body: thymeleaf.render(view, {
            title: content?.displayName ?? 'Schedule types',
            checks: renderedChecks,
            jobs: ourJobs,
            hasJobs: ourJobs.length !== 0,
            tasks,
            hasTasks: tasks.length !== 0,
            editable: req.mode === 'edit',
            stylesUrl: assetUrl({path: 'styles.css'}),
            scriptUrl: assetUrl({path: 'js/pages/schedule-types/schedule-types.js'})
        })
    };
};
