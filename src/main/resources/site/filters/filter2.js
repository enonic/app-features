var portal = require('/lib/xp/portal');
var filterHelper = require('/lib/filter-helper');

exports.responseFilter = function (req, res) {

    res.headers['X-Custom-Header'] = 'value2';

    var scriptUrl = portal.assetUrl({path: 'js/parts/auth/filter-test2.js'});
    filterHelper.addPageContribution(res, 'bodyEnd', '<script src="' + scriptUrl + '" type="text/javascript"></script>');

    res.body = res.body.replace(/(<h2\b[^>]*>)[^<>]*(<\/h2>)/ig, function (l) {
        return l.toUpperCase();
    });

    return res;
};
