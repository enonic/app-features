import * as thymeleaf from '/lib/thymeleaf';
import * as contentSvc from '/lib/xp/content';
import type {Request} from '@enonic-types/core';

const view = resolve('city-map.page.html');

function handleGet(req: Request) {
    let cityName: string | undefined;
    let cityLocation: string | undefined;

    if (req.params.city) {
        const city = getCity(req.params.city as string);
        if (city) {
            cityName = city.displayName;
            cityLocation = (city.data as Record<string, unknown>).cityLocation as string;
        }
    }

    cityLocation = cityLocation || "NaN,NaN";
    const coordinates = cityLocation.split(",");

    let cityMapGreeting = "Select city!";
    if (cityName) {
        cityMapGreeting = "City map of " + cityName;
    }

    const params = {
        cityLatitude: coordinates[0],
        cityLongitude: coordinates[1],
        cityMapGreeting: cityMapGreeting
    };

    const body = thymeleaf.render(view, params);

    function getCity(cityName: string) {
        const result = contentSvc.query({
            count: 1,
            contentTypes: [
                app.name + ':city'
            ],
            "query": "_name = '" + cityName + "'"
        });

        return result.hits[0];
    }

    return {
        contentType: 'text/html',
        body: body,
        "pageContributions": {
            headEnd: "<style>#map-canvas {width: 600px; height: 400px; }</style><script src='https://maps.googleapis.com/maps/api/js?key=AIzaSyChk5dtsBgSpViE_ZUpMsufxSWzd9yQA74'></script>"
        }
    };
}

export {handleGet as GET};
