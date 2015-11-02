exports.create = function () {

    //Documentation BEGIN
    var contentLib = require('/lib/xp/content');

    var result = contentLib.create({
        name: 'mycontent',
        parentPath: '/features/js-libraries',
        displayName: 'My Content',
        requireValid: true,
        contentType: app.name + ':all-input-types',
        branch: 'draft',
        language: 'no',
        data: {
            myCheckbox: true,
            myComboBox: 'option1',
            myDate: '1970-01-01',
            myDateTime: '1970-01-01T10:00',
            myDouble: 3.14,
            myGeoPoint: '59.91,10.75',
            myHtmlArea: '<p>htmlAreaContent</p>',
            myImageSelector: '5a5fc786-a4e6-4a4d-a21a-19ac6fd4784b',
            myLong: 123,
            myRelationship: 'features',
            myRadioButtons: 'option1',
            myTag: 'aTag',
            myTextArea: 'textAreaContent',
            myTextLine: 'textLineContent',
            myTime: '10:00',
            myTextAreas: [
                'textAreaContent1',
                'textAreaContent2'
            ],
            myItemSet: {
                'textLine': 'textLineContent',
                'long': 123
            }
        },
        x: {
            "com-enonic-app-features": {
                "menu-item": {
                    "menuItem": true
                }
            }
        }
    });

    log.info('Content created with id ' + result._id);
    //Documentation END

    log.info('Create result: ' + JSON.stringify(result, null, 4));

    return result;
};

exports.get = function () {

    //Documentation BEGIN
    var contentLib = require('/lib/xp/content');

    var result = contentLib.get({
        key: '/features/js-libraries/mycontent',
        branch: 'draft'
    });

    if (result) {
        log.info('Display Name = ' + result.displayName);
    } else {
        log.info('Content was not found');
    }
    //Documentation END

    log.info('Get result: ' + JSON.stringify(result, null, 4));

    return result;
};

exports.getChildren = function () {

    //Documentation BEGIN
    var contentLib = require('/lib/xp/content');

    var result = contentLib.getChildren({
        key: '/features/js-libraries/houses',
        start: 0,
        count: 2,
        sort: '_modifiedTime ASC',
        branch: 'draft'
    });

    log.info('Found ' + result.total + ' number of contents');

    for (var i = 0; i < result.hits.length; i++) {
        var content = result.hits[i];
        log.info('Content ' + content._name + ' loaded');
    }
    //Documentation END

    log.info('Get children result: ' + JSON.stringify(result, null, 4));

    return result;
};

exports.query = function () {

    //Documentation BEGIN
    var contentLib = require('/lib/xp/content');

    var result = contentLib.query({
        start: 0,
        count: 2,
        sort: "_modifiedTime DESC, geoDistance('data.location', '59.91,10.75')",
        query: "data.city = 'Oslo' AND fulltext('data.description', 'garden', 'AND') ",
        branch: "draft",
        contentTypes: [
            app.name + ":house",
            app.name + ":apartment"
        ],
        aggregations: {
            floors: {
                terms: {
                    field: "data.number_floor",
                    order: "_count asc"
                },
                aggregations: {
                    prices: {
                        histogram: {
                            field: "data.price",
                            interval: 1000000,
                            extendedBoundMin: 1000000,
                            extendedBoundMax: 3000000,
                            minDocCount: 0,
                            order: "_key desc"
                        }
                    }
                }
            },
            by_month: {
                dateHistogram: {
                    field: "data.publish_date",
                    interval: "1M",
                    minDocCount: 0,
                    format: "MM-yyyy"
                }
            },
            price_ranges: {
                range: {
                    field: "data.price",
                    ranges: [
                        {to: 2000000},
                        {from: 2000000, to: 3000000},
                        {from: 3000000}
                    ]
                }
            },
            my_date_range: {
                dateRange: {
                    field: "data.publish_date",
                    format: "MM-yyyy",
                    ranges: [
                        {to: "now-10M/M"},
                        {from: "now-10M/M"}
                    ]
                }
            },
            price_stats: {
                stats: {
                    field: "data.price"
                }
            }
        }
    });

    log.info('Found ' + result.total + ' number of contents');

    for (var i = 0; i < result.hits.length; i++) {
        var content = result.hits[i];
        log.info('Content ' + content._name + ' found');
    }
    //Documentation END

    log.info('Query result: ' + JSON.stringify(result, null, 4));

    return result;
};

exports.delete = function () {

    //Documentation BEGIN
    var contentLib = require('/lib/xp/content');

    var result = contentLib.delete({
        key: '/features/js-libraries/mycontent',
        branch: 'draft'
    });

    if (result) {
        log.info('Content deleted');
    } else {
        log.info('Content was not found');
    }
    //Documentation END

    log.info('Delete result: ' + JSON.stringify(result, null, 4));

    return result;
};

exports.modify = function () {

    //Documentation BEGIN
    function editor(c) {
        c.displayName = 'Modified';
        c.language = 'en';
        c.data.myCheckbox = false;
        c.data["myTime"] = "11:00";
        return c;
    }

    var contentLib = require('/lib/xp/content');

    var result = contentLib.modify({
        key: '/features/js-libraries/mycontent',
        editor: editor
    });

    if (result) {
        log.info('Content modified. New title is ' + result.displayName);
    } else {
        log.info('Content not found');
    }
    //Documentation END

    log.info('Modify result: ' + JSON.stringify(result, null, 4));

    return result;
};