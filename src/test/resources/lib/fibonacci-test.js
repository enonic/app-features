var lib = require('./fibonacci');
var t = require('/lib/xp/testing');

exports.testSequence4 = function () {
    var result = lib.fibonacci(4);
    t.assertJson([0, 1, 1, 2], result);
};

exports.testSequence6 = function () {
    var result = lib.fibonacci(6);
    t.assertJson([0, 1, 1, 2, 3, 5], result);
};
