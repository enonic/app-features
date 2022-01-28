var helper = require('/lib/custom-selector-helper');

function handleGet(req) {

    var params = helper.parseparams(req.params);

    var body = helper.createresults(getItems(), params);

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
    }
}

exports.get = handleGet;