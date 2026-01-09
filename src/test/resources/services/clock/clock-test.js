var t = require('/lib/xp/testing');

t.mock('/lib/time.js', { // <1>
    now: function () {
        return '2017-08-01T12:13:24.000Z';
    }
});

exports.testClock = function () {
    var service = require('./clock'); // <2>

    var result = service.get();
    t.assertEquals('Time is 2017-08-01T12:13:24.000Z', result.body);
};
