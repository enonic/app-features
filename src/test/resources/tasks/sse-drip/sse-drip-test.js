var t = require('/lib/xp/testing');

var sent = [];
var closed = [];
var openResponses = null;

t.mock('/lib/xp/sse.js', {
    send: function (params) {
        sent.push(params);
    },
    close: function (params) {
        closed.push(params);
    },
    isOpen: function () {
        if (openResponses === null) {
            return true;
        }
        return openResponses.length > 0 ? openResponses.shift() : false;
    }
});

t.mock('/lib/xp/task.js', {
    sleep: function () {
    }
});

exports.testDripSendsAllMessages = function () {
    sent = [];
    closed = [];
    openResponses = null;

    var task = require('./sse-drip');
    task.run({clientId: 'client-1', descriptionPrefix: 'sse-demo-'});

    t.assertEquals(5, sent.length);
    t.assertEquals('client-1', sent[0].clientId);
    t.assertEquals('message', sent[0].message.event);
    t.assertEquals('Thinking...', sent[0].message.data);
    t.assertEquals('Done!', sent[4].message.data);
    t.assertEquals(1, closed.length);
    t.assertEquals('client-1', closed[0].clientId);
};

exports.testDripStopsWhenClientDisconnects = function () {
    sent = [];
    closed = [];
    openResponses = [true, true, false];

    var task = require('./sse-drip');
    task.run({clientId: 'client-2', descriptionPrefix: 'sse-demo-'});

    t.assertEquals(2, sent.length);
    t.assertEquals(1, closed.length);
    t.assertEquals('client-2', closed[0].clientId);
};
