import * as cronLib from '/lib/cron';
import * as contextLib from '/lib/xp/context';
import {broadcastTick} from '/lib/cron-broadcaster';

export const DEFAULT_JOB_NAME = 'features-cron-tick';

interface StartParams {
    name?: string;
    fixedDelay?: number;
    delay?: number;
    cron?: string;
    times?: number;
}

function runAsAdmin<T>(callback: () => T): T {
    return contextLib.run({
        repository: 'system-repo',
        branch: 'master',
        principals: ['role:system.admin']
    }, callback) as T;
}

function buildSchedule(name: string, params: StartParams, defaultFixedDelay: number): cronLib.ScheduleParams {
    const schedule: cronLib.ScheduleParams = {
        name,
        callback: () => {
            broadcastTick(name);
        },
        context: {
            repository: 'system-repo',
            branch: 'master',
            user: {login: 'su', idProvider: 'system'},
            principals: ['role:system.admin']
        }
    };
    if (params.cron) {
        schedule.cron = params.cron;
    } else {
        schedule.fixedDelay = typeof params.fixedDelay === 'number' ? params.fixedDelay : defaultFixedDelay;
        schedule.delay = typeof params.delay === 'number' ? params.delay : 0;
    }
    if (typeof params.times === 'number') {
        schedule.times = params.times;
    }
    return schedule;
}

export function start(params: StartParams = {}): {job: cronLib.JobDescriptor | null; name: string} {
    const name = params.name || DEFAULT_JOB_NAME;
    runAsAdmin(() => cronLib.schedule(buildSchedule(name, params, 1000)));
    return {job: runAsAdmin(() => cronLib.get({name})), name};
}

export function reschedule(params: StartParams): {job: cronLib.JobDescriptor | null; name: string} {
    const name = params.name || DEFAULT_JOB_NAME;
    runAsAdmin(() => cronLib.reschedule(buildSchedule(name, params, 2000)));
    return {job: runAsAdmin(() => cronLib.get({name})), name};
}

export function stop(name?: string): {name: string; removed: boolean} {
    const jobName = name || DEFAULT_JOB_NAME;
    const before = runAsAdmin(() => cronLib.get({name: jobName}));
    runAsAdmin(() => cronLib.unschedule({name: jobName}));
    const after = runAsAdmin(() => cronLib.get({name: jobName}));
    return {name: jobName, removed: before !== null && after === null};
}

export function list(pattern?: string): cronLib.JobList {
    return runAsAdmin(() => cronLib.list(pattern ? {pattern} : undefined));
}

export function get(name?: string): cronLib.JobDescriptor | null {
    return runAsAdmin(() => cronLib.get({name: name || DEFAULT_JOB_NAME}));
}
