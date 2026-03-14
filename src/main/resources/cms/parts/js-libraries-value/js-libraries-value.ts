import * as portal from '/lib/xp/portal';
const thymeleaf = require('/lib/thymeleaf') as any;
import * as valueLib from '/lib/xp/value';
import * as ioLib from '/lib/xp/io';
import type { Request } from '@enonic-types/core';

const view = resolve('js-libraries-value.html');

function handleGet(req: Request) {
    const geoPointResult = valueLib.geoPoint(10, 12);
    const getPointStringResult = valueLib.geoPointString('10,12');
    const instantResult = valueLib.instant('2016-12-06T15:54:30Z');
    const localDateTimeResult = valueLib.localDateTime('2016-12-06T15:54:30');
    const localDateResult = valueLib.localDate('2016-12-06');
    const localTimeResult = valueLib.localTime('10:23:30');
    const referenceResult = valueLib.reference('221e3218-aaeb-4798-885c-d33a06a2b295');
    const binaryResult = valueLib.binary('myBinary', ioLib.newStream('myText'));

    const params = {
        geoPointResult: geoPointResult,
        getPointStringResult: getPointStringResult,
        instantResult: instantResult,
        localDateTimeResult: localDateTimeResult,
        localDateResult: localDateResult,
        localTimeResult: localTimeResult,
        referenceResult: referenceResult,
        binaryResult: binaryResult
    };

    const body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

export { handleGet as GET };
