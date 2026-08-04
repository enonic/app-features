var t = require('/lib/xp/testing');

var sent = [];
var submitted = [];

t.mock('/lib/xp/sse.js', {
    send: function (params) {
        sent.push(params);
    }
});

t.mock('/lib/xp/task.js', {
    submitTask: function (params) {
        submitted.push(params);
        return 'task-id-7';
    }
});

exports.testOpenSubmitsDripTask = function () {
    sent = [];
    submitted = [];

    var lib = require('/lib/sse');
    lib.handleEvent({type: 'open', clientId: 'client-9'}, 'sse-demo-');

    t.assertEquals(1, sent.length);
    t.assertEquals('Hello!', sent[0].message.data);
    t.assertEquals(1, submitted.length);
    t.assertEquals('sse-drip', submitted[0].descriptor);
    t.assertEquals('client-9', submitted[0].config.clientId);
    t.assertEquals('sse-demo-', submitted[0].config.descriptionPrefix);
};

exports.testNonOpenEventIgnored = function () {
    sent = [];
    submitted = [];

    var lib = require('/lib/sse');
    lib.handleEvent({type: 'close', clientId: 'client-9'}, 'sse-demo-');

    t.assertEquals(0, sent.length);
    t.assertEquals(0, submitted.length);
};
