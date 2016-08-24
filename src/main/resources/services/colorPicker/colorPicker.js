var contentLib = require('/lib/xp/content');
var contextLib = require('/lib/xp/context');
var portalLib = require('/lib/xp/portal');

function handleGet(req) {

    var q = req.params['query'],
        ids = req.params['ids'],
        start, count, end;

    try {
        start = parseInt(req.params['start']) || 0;
    } catch (e) {
        start = 0;
    }

    try {
        count = parseInt(req.params['count']) || 10;
    } catch (e) {
        count = 10;
    }

    end = start + count;

    log.debug('Color picker service ids: %s, start: %s, end: %s, count: %s', JSON.stringify(ids), start, end, count);

    var body = {
        total: 16,
        count: 16,
        hits: [
            getItemFor('#FFFFFF', 'White'),
            getItemFor('#C0C0C0', 'Silver'),
            getItemFor('#808080', 'Gray'),
            getItemFor('#000000', 'Black'),
            getItemFor('#FF0000', 'Red'),
            getItemFor('#800000', 'Maroon'),
            getItemFor('#FFFF00', 'Yellow'),
            getItemFor('#808000', 'Olive'),
            getItemFor('#00FF00', 'Lime'),
            getItemFor('#008000', 'Green'),
            getItemFor('#00FFFF', 'Aqua'),
            getItemFor('#008080', 'Teal'),
            getItemFor('#0000FF', 'Blue'),
            getItemFor('#000080', 'Navy'),
            getItemFor('#FF00FF', 'Fuchsia'),
            getItemFor('#800080', 'Purple')
        ]
    };

    var hitCount = 0, include;
    body.hits = body.hits.filter(function (hit) {
        if (!!q && q.trim().length > 0) {
            var queryRegex = new RegExp(q, 'i');
            include = queryRegex.test(hit.displayName) || queryRegex.test(hit.description) || queryRegex.test(hit.id);
        } else {
            include = true;
        }
        if (include) {
            hitCount++;
        }
        return include && hitCount > start && hitCount <= end;
    });
    body.count = Math.min(count, body.hits.length);

    return {
        contentType: 'application/json',
        body: body
    }
}

function getItemFor(color, desc) {
    return {
        id: color,
        displayName: color,
        description: desc,
        icon: getIconFor(color)
    }
}

function getIconFor(color) {
    return {
        data: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="32" height="32" viewBox="0 0 32 32">' +
        '<rect x="0" y="0" width="32" height="32" rx="4" ry="4" fill="' + color + '"/>' +
        '</svg>',
        type: 'image/svg+xml'
    }
}

exports.get = handleGet;