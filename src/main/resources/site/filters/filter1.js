var portal = require('/lib/xp/portal');
var filterHelper = require('/lib/filter-helper');

exports.responseFilter = function (req, res) {

    res.headers['X-Custom-Header'] = 'value1';
    res.status = 202;

    var scriptUrl = portal.assetUrl({path: 'js/parts/auth/filter-test.js'});
    filterHelper.addPageContribution(res, 'bodyEnd', '<script src="' + scriptUrl + '" type="text/javascript"></script>');

    res.body = res.body.replace(/(<label\b[^>]*>)[^<>]*(<\/label>)/ig, function (l) {
        return l.toUpperCase();
    });

    return res;
};
