import * as portal from '/lib/xp/portal';
import * as thymeleaf from '/lib/thymeleaf';
import * as contentSvc from '/lib/xp/content';
import type {Request} from '@enonic-types/core';

const view = resolve('cities-distance-facet.part.html');

function handleGet(req: Request) {
    let currentCityName: any;
    let cities: any;

    if (req.params.city) {
        const city = getCity(req.params.city);
        if (city) {
            currentCityName = city.displayName;
            const cityLocation = city.data.cityLocation as string;
            const cityLocationVal = cityLocation || "NaN,NaN";
            const coordinates = cityLocationVal.split(",");
            cities = contentSvc.query({
                start: 0,
                count: 50,
                contentTypes: [
                    app.name + ':city'
                ],
                "sort": "geoDistance('data.cityLocation','" + city.data.cityLocation + "')",
                "query": "_name != '" + currentCityName + "'",
                "aggregations": {
                    "distance": {
                        "geoDistance": {
                            'field': "data.cityLocation",
                            'unit': "km",
                            'origin': {
                                'lat': coordinates[0],
                                'lon': coordinates[1]
                            },
                            'ranges': [{'from': 0, 'to': 1200}, {'from': 1200, 'to': 4000}, {'from': 4000, 'to': 12000},
                                {'from': 12000}]
                        }
                    }
                }
            });
        }
    }

    if (!currentCityName) {
        currentCityName = "None";
    }

    if (!cities) {
        cities = contentSvc.query({
            start: 0,
            count: 25,
            contentTypes: [
                app.name + ':city'
            ]
        });
    }

    const content = portal.getContent();
    const currentPage = portal.pageUrl({
        path: content._path
    });

    let buckets: any;
    if (cities.aggregations.distance) {
        buckets = cities.aggregations.distance.buckets;
    }

    const params = {
        cities: cities.hits,
        total: cities.total,
        buckets: buckets,
        currentCity: currentCityName,
        currentPage: currentPage
    };

    const body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };

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
}

export {handleGet as GET};
