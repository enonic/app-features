var service = require('./hello');
var t = require('/lib/xp/testing');

exports.testParam = function () {
    var result = service.get({
        params: {
            name: 'Donald'
        }
    });

    t.assertEquals('Hello Donald', result.body);
    t.assertEquals('text/plain', result.contentType);
};

exports.testNoParam = function () {
    var result = service.get({
        params: {}
    });

    t.assertEquals('Hello World', result.body);
    t.assertEquals('text/plain', result.contentType);
};
