import * as taskLib from '/lib/xp/task';
import {get as getContext} from '/lib/xp/context';

interface ScheduleProbeConfig {
    sleepMs?: number;
}

export function run(config: ScheduleProbeConfig): void {
    // XP 8.1: a scheduled task learns the task id of its job's previous run from the context.
    // Absent on a job's first run, and on a job whose last run left no record.
    const lastTaskId = getContext().attributes['schedule.lastTaskId'] as string | undefined;
    const previous = lastTaskId ? taskLib.get(lastTaskId) : null;

    taskLib.progress({
        info: 'lastTaskId=' + (lastTaskId ?? 'none') + ' previousState=' + (previous?.state ?? 'none')
    });

    log.info('schedule-probe: lastTaskId=%s previousState=%s', lastTaskId ?? 'none', previous?.state ?? 'none');

    const sleepMs = config.sleepMs ?? 0;
    if (sleepMs > 0) {
        taskLib.sleep(sleepMs);
    }

    taskLib.progress({
        info: 'done, lastTaskId=' + (lastTaskId ?? 'none')
    });
}
