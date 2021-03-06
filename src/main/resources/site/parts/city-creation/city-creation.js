var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/thymeleaf');
var contentSvc = require('/lib/xp/content');

var view = resolve('city-creation.page.html');
var service = require('/lib/service.js').service;

function handleGet(req) {
    var cityServiceUrl = service.serviceUrl('city');
    var content = portal.getContent();

    var cityName;
    var cityLocation;
    if (req.params.city) {
        var city = getCity(req.params.city);
        if (city) {
            cityName = city.displayName;
            cityLocation = city.data.cityLocation;
        }
    }

    cityName = cityName || "City Name";
    cityLocation = cityLocation || "lat,lon";

    var params = {
        cityServiceUrl: cityServiceUrl,
        parentPath: content._path,
        defaultCityName: cityName,
        defaultCityLocation: cityLocation
    };
    var body = thymeleaf.render(view, params);

    function getCity(cityName) {
        var result = contentSvc.query({
                count: 1,
                contentTypes: [
                    app.name + ':city'
                ],
                "query": "_name = '" + cityName + "'"
            }
        );

        return result.hits[0];
    }

    return {
        contentType: 'text/html',
        body: body
    };
}

exports.get = handleGet;