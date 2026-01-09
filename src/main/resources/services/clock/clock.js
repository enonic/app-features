var time = require('/lib/time');

exports.get = function () {
    return {
        body: 'Time is ' + time.now()
    };
};
