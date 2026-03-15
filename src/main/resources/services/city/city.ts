import * as portal from '/lib/xp/portal';
import * as contentSvc from '/lib/xp/content';
import type {Request} from '@enonic-types/core';

function handlePost(req: Request) {
    const parentPath = req.params.parentPath as string;
    const cityName = req.params.cityName as string;
    const cityLocation = req.params.cityLocation as string;

    if (cityName && cityLocation) {
        const city = getCity(cityName);

        if (city) {
            modifyCity(city, cityName, cityLocation);
        } else {
            createCity(cityName, cityLocation);
        }
    }

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

    function modifyCity(city: any, cityName: any, cityLocation: any) {
        const result = contentSvc.update({
            key: city._id,
            editor: function (c: any) {
                c.data.cityLocation = cityLocation;
                return c;
            }
        });

        return result;
    }

    function createCity(cityName: any, cityLocation: any) {
        const result = contentSvc.create({
            name: cityName,
            parentPath: parentPath,
            displayName: cityName,
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
    };
}

export {handlePost as POST};
