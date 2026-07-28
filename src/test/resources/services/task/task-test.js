var t = require('/lib/xp/testing');

var submitted = [];

t.mock('/lib/xp/task.js', {
    submitTask: function (params) {
        submitted.push(params);
        return 'task-id-42';
    }
});

exports.testGetSubmitsNamedTask = function () {
    submitted = [];

    var service = require('./task');
    var result = service.GET();

    t.assertEquals('text/plain', result.contentType);
    t.assertEquals('Task submitted: task-id-42', result.body);
    t.assertEquals(1, submitted.length);
    t.assertEquals('progress-demo', submitted[0].descriptor);
};
