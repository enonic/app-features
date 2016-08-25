var contentLib = require('/lib/xp/content');
var contextLib = require('/lib/xp/context');
var portalLib = require('/lib/xp/portal');

function handleGet(req) {

    var q = req.params['query'],
        ids, start, count, end;

    log.info('Color picker service params: %s', req.params);

    try {
        ids = JSON.parse(req.params['ids']) || []
    } catch (e) {
        log.warning('Invalid parameter ids: %s, using []', req.params['ids']);
        ids = [];
    }

    try {
        start = parseInt(req.params['start']) || 0;
    } catch (e) {
        log.warning('Invalid parameter start: %s, using 0', req.params['start']);
        start = 0;
    }

    try {
        count = parseInt(req.params['count']) || 15;
    } catch (e) {
        log.warning('Invalid parameter count: %s, using 15', req.params['count']);
        count = 15;
    }

    end = start + count;

    var body = {
        total: 16,
        count: 16,
        hits: getItems()
    };

    var hitCount = 0, include;
    body.hits = body.hits.filter(function (hit) {
        include = true;

        if (!!ids && ids.length > 0) {
            include = ids.some(function (id) {
                return id == hit.id;
            });
        } else if (!!q && q.trim().length > 0) {
            var qRegex = new RegExp(q, 'i');
            include = qRegex.test(hit.displayName) || qRegex.test(hit.description) || qRegex.test(hit.id);
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

function getItems() {
    return [
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
    ];
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