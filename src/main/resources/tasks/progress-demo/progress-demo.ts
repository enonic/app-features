import * as taskLib from '/lib/xp/task';

const STEPS = ['one', 'two', 'three'];

export function run(_config: Record<string, unknown>, taskId: string): void {
    log.info('Hello! ');

    for (let i = 0; i < STEPS.length; i++) {
        taskLib.sleep(1000);

        taskLib.progress({
            info: 'Step ' + STEPS[i],
            current: i + 1,
            total: STEPS.length
        });

        const task = taskLib.get(taskId);
        log.info(JSON.stringify(task, null, 4));
    }

    const tasks = taskLib.list();
    log.info(JSON.stringify(tasks, null, 4));

    taskLib.progress({
        info: 'Done!'
    });
}
