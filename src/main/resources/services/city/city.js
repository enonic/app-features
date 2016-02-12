var portal = require('/lib/xp/portal');
var contentSvc = require('/lib/xp/content');

function handlePost(req) {

    var parentPath = req.params.parentPath;
    var cityName = req.params.cityName;
    var cityLocation = req.params.cityLocation;

    if (cityName && cityLocation) {
        var city = getCity(cityName);

        if (city) {
            modifyCity(city, cityName, cityLocation)
        } else {
            createCity(cityName, cityLocation);
        }
    }

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

    function modifyCity(city, cityName, cityLocation) {

        var result = contentSvc.modify({
            key: city._id,
            editor: function (c) {
                c.data.cityLocation = cityLocation;
                return c;
            }
        });

        return result;
    }

    function createCity(cityName, cityLocation) {
        var result = contentSvc.create({
            name: cityName,
            parentPath: parentPath,
            displayName: cityName,
            draft: false,
            requireValid: true,
            contentType: app.name + ':city',
            data: {
                cityLocation: cityLocation
            }
        });

        return result;
    }

    return {
        redirect: portal.pageUrl({
            path: parentPath,
            params: {
                city: cityName
            }
        })
    }
}

exports.post = handlePost;