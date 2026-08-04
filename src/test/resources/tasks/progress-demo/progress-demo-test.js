var t = require('/lib/xp/testing');

var progressCalls = [];
var getCalls = [];
var listCalled = 0;

t.mock('/lib/xp/task.js', {
    sleep: function () {
    },
    progress: function (params) {
        progressCalls.push(params);
    },
    get: function (taskId) {
        getCalls.push(taskId);
        return {id: taskId, state: 'RUNNING'};
    },
    list: function () {
        listCalled++;
        return [];
    }
});

exports.testProgressReportedForEachStep = function () {
    progressCalls = [];
    getCalls = [];
    listCalled = 0;

    var task = require('./progress-demo');
    task.run({}, 'task-abc');

    t.assertEquals(4, progressCalls.length);
    t.assertEquals('Step one', progressCalls[0].info);
    t.assertEquals(1, progressCalls[0].current);
    t.assertEquals(3, progressCalls[0].total);
    t.assertEquals('Step three', progressCalls[2].info);
    t.assertEquals(3, progressCalls[2].current);
    t.assertEquals('Done!', progressCalls[3].info);
};

exports.testTaskIdComesFromContext = function () {
    progressCalls = [];
    getCalls = [];
    listCalled = 0;

    var task = require('./progress-demo');
    task.run({}, 'task-xyz');

    t.assertEquals(3, getCalls.length);
    t.assertEquals('task-xyz', getCalls[0]);
    t.assertEquals('task-xyz', getCalls[2]);
    t.assertEquals(1, listCalled);
};
