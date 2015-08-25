var thymeleaf = require('/lib/xp/thymeleaf');
var contentSvc = require('/lib/xp/content');

var view = resolve('city-map.page.html');

function handleGet(req) {
    var cityName;
    var cityLocation;

    if (req.params.city) {
        var city = getCity(req.params.city);
        if (city) {
            cityName = city.displayName;
            cityLocation = city.data.cityLocation;
        }
    }

    cityLocation = cityLocation || "NaN,NaN";
    var coordinates = cityLocation.split(",");

    var cityMapGreeting = "Select city!";
    if (cityName) {
        cityMapGreeting = "City map of " + cityName;
    }

    var params = {
        cityLatitude: coordinates[0],
        cityLongitude: coordinates[1],
        cityMapGreeting: cityMapGreeting
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
        body: body,
        "pageContributions": {
            headEnd: "<style>#map-canvas {width: 600px; height: 400px; }</style><script src='https://maps.googleapis.com/maps/api/js'></script>"
        }
    };
}

exports.get = handleGet;