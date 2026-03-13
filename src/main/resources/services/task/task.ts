import * as portal from '/lib/xp/portal';
import * as taskLib from '/lib/xp/task';

function handleGet(req: any) {
    const steps = ['one', 'two', 'three'];

    const taskId = (taskLib as any).submit({
        description: 'my test',
        task: function() {
            log.info('Hello! ');

            for (let i = 0; i < steps.length; i++) {
                taskLib.sleep(1000);

                taskLib.progress({
                    info: 'Step ' + steps[i],
                    current: i + 1,
                    total: steps.length
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
    } as any);

    return {
        contentType: 'text/plain',
        body: 'Task submitted: ' + taskId
    };
}

export { handleGet as GET };
