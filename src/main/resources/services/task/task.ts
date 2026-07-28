import * as taskLib from '/lib/xp/task';

export function GET() {
    const taskId = taskLib.submitTask({
        descriptor: 'progress-demo'
    });

    return {
        contentType: 'text/plain',
        body: 'Task submitted: ' + taskId
    };
}
