var t = require('/lib/xp/testing');
var model;
var query;
var currentBranch = 'draft';
var baseUrl = 'https://site.example';
var branchUrl = 'https://published.example';
var apiUrl = 'https://request.example/_/com.enonic.app.features:sse';

function site() {
    return {
        _id: 'site-id',
        _path: '/features',
        data: {siteConfig: [{applicationKey: 'portal', config: {
            baseUrl: currentBranch === 'draft' ? baseUrl : branchUrl
        }}]}
    };
}

t.mock('/lib/xp/content.js', {
    get: function () { return {_id: 'other', _path: '/features/request-steering'}; },
    getSite: site
});
t.mock('/lib/xp/context.js', {
    run: function (context, fn) {
        var previous = currentBranch;
        currentBranch = context.branch;
        try { return fn(); } finally { currentBranch = previous; }
    }
});
t.mock('/lib/xp/portal.js', {
    getContent: function () { return {_id: 'page', _path: '/features/portal-functions/pageurl'}; },
    getSite: site,
    pageUrl: function (params) {
        if (params.project || params.branch || params.base) {
            throw new Error('Explicit-context examples must use the Java API');
        }
        if (params.params && params.params.q) {
            return '/portal-functions/pageurl?' + query;
        }
        return '/portal-functions/pageurl';
    },
    apiUrl: function () { return apiUrl; }
});
t.mock('/lib/thymeleaf.js', {
    render: function (view, params) {
        model = params;
        return 'rendered';
    }
});

function encodingVerdict(value) {
    query = value;
    require('./pageUrl/pageUrl').GET({branch: 'draft', host: 'request.example'});
    return model.requestRows.filter(function (row) {
        return row.call === 'pageUrl({path, params}) with a value needing escaping';
    })[0].verdict;
}

exports.testEncodingPreservesTheEntireParameterValue = function () {
    t.assertEquals('pass', encodingVerdict('q=a%20b%26c'));
    t.assertEquals('pass', encodingVerdict('q=a+b%26c'));
    t.assertEquals('FAIL', encodingVerdict('q=a%20b&c'));
    t.assertEquals('FAIL', encodingVerdict('q=a b%26c'));
    t.assertEquals('FAIL', encodingVerdict('q=a%20b%26c&q=another'));
    t.assertEquals('FAIL', encodingVerdict('other=c'));
};

exports.testApiUrlBaseNoteDoesNotChangeTheLink = function () {
    require('./apiUrl/apiUrl').GET({host: 'request.example'});
    var row = model.rows.filter(function (one) {
        return one.call === "apiUrl({api, type: 'absolute'}) with a site base URL set";
    })[0];
    t.assertEquals(apiUrl, row.got);
    t.assertEquals(true, row.link);
    t.assertEquals('Site base URL: ' + baseUrl, row.note);
};
