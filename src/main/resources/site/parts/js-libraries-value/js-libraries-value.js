var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');
var valueLib = require('/lib/xp/value');

var view = resolve('js-libraries-value.html');

function handleGet(req) {

    var geoPointResult = valueLib.geoPoint(10, 12);
    var getPointStringResult = valueLib.geoPointString('10,12');
    var instantResult = valueLib.instant('2016-12-06T15:54:30Z');


    var params = {
        geoPointResult: geoPointResult,
        getPointStringResult: getPointStringResult,
        instantResult: instantResult
    };

    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

exports.get = handleGet;