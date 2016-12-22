var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');
var valueLib = require('/lib/xp/value');
var ioLib = require('/lib/xp/io');

var view = resolve('js-libraries-value.html');

function handleGet(req) {

    var geoPointResult = valueLib.geoPoint(10, 12);
    var getPointStringResult = valueLib.geoPointString('10,12');
    var instantResult = valueLib.instant('2016-12-06T15:54:30Z');
    var localDateTimeResult = valueLib.localDateTime('2016-12-06T15:54:30');
    var localDateResult = valueLib.localDate('2016-12-06');
    var localTimeResult = valueLib.localTime('10:23:30');
    var referenceResult = valueLib.reference('221e3218-aaeb-4798-885c-d33a06a2b295');
    var binaryResult = valueLib.binary('myBinary', ioLib.newStream('myText'));


    var params = {
        geoPointResult: geoPointResult,
        getPointStringResult: getPointStringResult,
        instantResult: instantResult,
        localDateTimeResult: localDateTimeResult,
        localDateResult: localDateResult,
        localTimeResult: localTimeResult,
        referenceResult: referenceResult,
        binaryResult: binaryResult
    };

    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

exports.get = handleGet;