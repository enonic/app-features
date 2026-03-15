import * as portal from '/lib/xp/portal';
import * as thymeleaf from '/lib/thymeleaf';
import * as contentSvc from '/lib/xp/content';
import * as serviceLib from '/lib/service';
import type {Request} from '@enonic-types/core';

const view = resolve('city-creation.page.html');
const service = serviceLib.service;

function handleGet(req: Request) {
    const cityServiceUrl = service.serviceUrl('city');
    const content = portal.getContent();

    let cityName: any;
    let cityLocation: any;
    if (req.params.city) {
        const city = getCity(req.params.city);
        if (city) {
            cityName = city.displayName;
            cityLocation = city.data.cityLocation;
        }
    }

    cityName = cityName || "City Name";
    cityLocation = cityLocation || "lat,lon";

    const params = {
        cityServiceUrl: cityServiceUrl,
        parentPath: content._path,
        defaultCityName: cityName,
        defaultCityLocation: cityLocation
    };
    const body = thymeleaf.render(view, params);

    function getCity(cityName: any) {
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
        body: body
    };
}

export {handleGet as GET};
