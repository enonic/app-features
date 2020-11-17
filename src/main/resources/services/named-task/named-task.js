var taskLib = require('/lib/xp/task');

function handleGet(req) {
    var taskId = taskLib.submitNamed({
            name: req.params.name,
            config: req.params.config ? JSON.parse(req.params.config) : undefined
        }
    );
    return {
        contentType: 'text/plain',
        body: 'Task submitted: ' + taskId
    };
}

exports.get = handleGet;
