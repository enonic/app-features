import * as portal from '/lib/xp/portal';
const thymeleaf = require('/lib/thymeleaf') as any;
import * as contentSvc from '/lib/xp/content';

const view = resolve('cities-list.page.html');

function handleGet(req: any) {
    let currentCityName: any;
    let cities: any;

    if (req.params.city) {
        const city = getCity(req.params.city);
        if (city) {
            currentCityName = (city as any).displayName;
            cities = contentSvc.query({
                start: 0,
                count: 25,
                contentTypes: [
                    app.name + ':city'
                ],
                "sort": "geoDistance('data.cityLocation','" + (city as any).data.cityLocation + "')",
                "query": "_name != '" + currentCityName + "'"
            } as any);
        }
    }

    if (!currentCityName) {
        currentCityName = "Select";
    }

    if (!cities) {
        cities = contentSvc.query({
            start: 0,
            count: 25,
            contentTypes: [
                app.name + ':city'
            ]
        } as any);
    }

    const content = portal.getContent() as any;
    const currentPage = portal.pageUrl({
        path: content._path
    });

    const part = portal.getComponent() as any;
    const title = part.config.title || '<please configure title>';

    const params = {
        cities: cities.hits,
        currentCity: currentCityName,
        currentPage: currentPage,
        title: title
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
        body: body
    };
}

export { handleGet as GET };
