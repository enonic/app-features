const thymeleaf = require('/lib/thymeleaf') as any;
import * as contentSvc from '/lib/xp/content';

const view = resolve('city-map.page.html');

function handleGet(req: any) {
    let cityName: any;
    let cityLocation: any;

    if (req.params.city) {
        const city = getCity(req.params.city);
        if (city) {
            cityName = (city as any).displayName;
            cityLocation = (city as any).data.cityLocation;
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

    function getCity(cityName: any) {
        const result = contentSvc.query({
            count: 1,
            contentTypes: [
                app.name + ':city'
            ],
            "query": "_name = '" + cityName + "'"
        } as any);

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

export { handleGet as get };
