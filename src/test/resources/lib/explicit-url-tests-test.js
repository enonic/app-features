var t = require('/lib/xp/testing');

t.mock('/lib/xp/context.js', {
    run: function (context, fn) {
        t.assertEquals('com.enonic.cms.features', context.repository);
        t.assertEquals('draft', context.branch);
        return fn();
    }
});

var suite = require('/lib/explicit-url-tests');

function expectedOutcome(test) {
    if (test.expectedError) {
        throw new Error(test.expected);
    }
    return test.expected;
}

exports.testMismatchAndExceptionDoNotChangeExpectationsOrStopTheSuite = function () {
    var index = 0;
    var result = suite.runTests(function () {
        var test = suite.testCases[index++];
        if (index === 1) {
            return 'https://unexpected.example/page';
        }
        if (index === 2) {
            throw new Error('Content unavailable');
        }
        return expectedOutcome(test);
    });

    t.assertEquals(33, index);
    t.assertEquals(2, result.failed);
    t.assertEquals(31, result.passed);
    t.assertEquals('/features/portal-functions/pageurl', result.results[0].expected);
    t.assertEquals('https://unexpected.example/page', result.results[0].actual);
    t.assertEquals('FAIL', result.results[0].verdict);
    t.assertEquals('https://example.com/demo/portal-functions/pageurl', result.results[1].expected);
    t.assertEquals('Content unavailable', result.results[1].actual);
    t.assertEquals(true, result.results[1].error);
    t.assertEquals(false, result.results[1].link);
    t.assertEquals('OK', result.results[32].verdict);
    var outOfScope = result.results.filter(function (row) { return row.expectedError; })[0];
    t.assertEquals('Content [/unbased/folder] is not inside [/features]', outOfScope.actual);
    t.assertEquals('OK', outOfScope.verdict);
    t.assertEquals(true, outOfScope.error);
    t.assertEquals(false, outOfScope.link);
};

exports.testQuerySpaceEquivalenceDoesNotHideABrokenQuery = function () {
    var index = 0;
    var equivalent = suite.runTests(function () {
        var expected = expectedOutcome(suite.testCases[index++]);
        return expected === null ? null : expected.replace(/%20/g, '+');
    });
    t.assertEquals(0, equivalent.failed);

    index = 0;
    var broken = suite.runTests(function () {
        var expected = expectedOutcome(suite.testCases[index++]);
        return expected === null ? null : expected.replace(/%26/g, '&');
    });
    t.assertEquals(2, broken.failed);
    var queryResults = broken.results.filter(function (result) {
        return result.label === 'Encoded query value';
    });
    t.assertEquals(2, queryResults.length);
    queryResults.forEach(function (result) {
        t.assertEquals('FAIL', result.verdict);
    });
};

exports.testExpectedExceptionRejectsReturnValuesAndUnrelatedErrors = function () {
    [null, '/unbased/folder', 'Content [/unbased/folder] is not inside [/features]', new Error('Content unavailable')].forEach(function (actual) {
        var index = 0;
        var result = suite.runTests(function () {
            var test = suite.testCases[index++];
            if (!test.expectedError) {
                return expectedOutcome(test);
            }
            if (actual instanceof Error) {
                throw actual;
            }
            return actual;
        });
        t.assertEquals(33, index);
        t.assertEquals(1, result.failed);
        var outOfScope = result.results.filter(function (row) { return row.expectedError; })[0];
        t.assertEquals('FAIL', outOfScope.verdict);
        t.assertEquals(actual instanceof Error, outOfScope.error);
    });
};
