var assert = require('/lib/xp/assert');

var requestMock = {
    params: {
        debug: 'false'
    }
};

var error = require('./error');

exports.test404 = function () {

    var result = error.handle404({
        request: requestMock
    });

    assert.assertEquals('text/html', result.contentType);
    assert.assertNotNull(result.body);

};

exports.testDefault = function () {

    var result = error.handleError({
        request: requestMock
    });

    assert.assertEquals('text/html', result.contentType);
    assert.assertNotNull(result.body);

};
