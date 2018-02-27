var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');
var contentLib = require('/lib/xp/content');
var view = resolve('search-content-query.html');

function handleGet(req) {

    var params = {
        all: allResult(),
        filterArray: filterArray(),
        singleFilter: singleFilter()
    };

    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}


var allResult = function () {

    var query = {
        start: 0,
        count: 10,
        contentTypes: [
            app.name + ":search"
        ]
    };

    return {query: query, result: contentLib.query(query)};
};

var filterArray = function () {

    var query = {
        start: 0,
        count: 10,
        contentTypes: [
            app.name + ":search"
        ],
        filters: [
            {
                exists: {
                    field: "data.htmlarea_text1"
                }
            },
            {
                exists: {
                    field: "data.htmlarea_text1"
                }
            }
        ]
    };

    return {query: query, result: contentLib.query(query)};

};


var singleFilter = function () {

    var query = {
        start: 0,
        count: 10,
        contentTypes: [
            app.name + ":search"
        ],
        filters: {
            exists: {
                field: "data.htmlarea_text1"
            }
        }
    };

    return {query: query, result: contentLib.query(query)};

};


exports.get = handleGet;