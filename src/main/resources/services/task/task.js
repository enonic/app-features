var portal = require('/lib/xp/portal');
var taskLib = require('/lib/xp/task');

function handleGet(req) {

    var steps = ['one', 'two', 'three'];

    var taskId = taskLib.submit({
        description: 'my test',
        task: function (id) {
            log.info('Hello! ' + id);

            for (var i = 0; i < steps.length; i++) {
                taskLib.sleep(1000);

                taskLib.progress({
                    info: 'Step ' + steps[i],
                    current: i + 1,
                    total: steps.length
                });

                var task = taskLib.get(taskId);
                log.info(JSON.stringify(task, null, 4));
            }

            var tasks = taskLib.list();
            log.info(JSON.stringify(tasks, null, 4));

            taskLib.progress({
                info: 'Done!'
            });

        }
    });

    return {
        contentType: 'text/plain',
        body: 'Task submitted: ' + taskId
    };
}

exports.get = handleGet;
