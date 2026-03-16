export function create() {
    const contentLib = require('/lib/xp/content');

    const result = contentLib.create({
        name: 'mycontent',
        parentPath: '/features/js-libraries',
        displayName: 'My Content',
        requireValid: true,
        contentType: app.name + ':all-input-types',
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
            myImageSelector2: '3d37979c-3269-48b3-ab02-9e7efe69e744',
            myLong: 123,
            myMediaSelector: 'a3e276b6-62a9-44e8-ace2-3bd2e9f08d2f',
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
            },
            checkOptionSet: {
                _selected: ["option_2", "option_3"],
                option_2: {
                    contentSelector: '5a5fc786-a4e6-4a4d-a21a-19ac6fd4784b'
                },
                option_3: {
                    textarea: 'My Another Text Area',
                    long: 555
                }
            },
            radioOptionSet: {
                _selected: "option_3",
                option_3: {
                    textarea: 'My Text Area',
                    long: 123
                }
            }
        }
    });

    log.info('Content created with id ' + result._id);
    log.info('Create result: ' + JSON.stringify(result, null, 4));

    return result;
}

export function get() {
    const contentLib = require('/lib/xp/content');

    const result = contentLib.get({
        key: '/features/js-libraries/mycontent'
    });

    if (result) {
        log.info('Display Name = ' + result.displayName);
    } else {
        log.info('Content was not found');
    }

    log.info('Get result: ' + JSON.stringify(result, null, 4));

    return result;
}

export function exists(key: string) {
    const contentLib = require('/lib/xp/content');

    const result = contentLib.exists({
        key: key
    });

    if (result) {
        log.info('Content found');
    } else {
        log.info('Content was not found');
    }

    return result;
}

export function getChildren() {
    const contentLib = require('/lib/xp/content');

    const result = contentLib.getChildren({
        key: '/features/js-libraries/houses',
        start: 0,
        count: 2,
        sort: '_modifiedTime ASC'
    });

    log.info('Found ' + result.total + ' number of contents');

    for (let i = 0; i < result.hits.length; i++) {
        const content = result.hits[i];
        log.info('Content ' + content._name + ' loaded');
    }

    log.info('Get children result: ' + JSON.stringify(result, null, 4));

    return result;
}

export function query() {
    const contentLib = require('/lib/xp/content');

    const result = contentLib.query({
        start: 0,
        count: 2,
        sort: "modifiedTime DESC, geoDistance('data.location', '59.91,10.75')",
        query: "data.city = 'Oslo' AND fulltext('data.description', 'garden', 'AND') ",
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
        },
        highlight: {
            properties: {
                "data.city": {},
                "data.description": {
                    preTag: "<b>",
                    postTag: "</b>"
                }
            }
        }
    });

    log.info('Found ' + result.total + ' number of contents');

    for (let i = 0; i < result.hits.length; i++) {
        const content = result.hits[i];
        log.info('Content ' + content._name + ' found');
    }

    log.info('Query result: ' + JSON.stringify(result, null, 4));

    return result;
}

export function deleteContent() {
    const contentLib = require('/lib/xp/content');

    const result = contentLib.delete({
        key: '/features/js-libraries/mycontent'
    });

    if (result) {
        log.info('Content deleted');
    } else {
        log.info('Content was not found');
    }

    log.info('Delete result: ' + JSON.stringify(result, null, 4));

    return result;
}

export function modify() {
    function editor(c: ReturnType<typeof contentLib.get>) {
        c.displayName = 'Modified';
        c.language = 'en';
        (c.data as Record<string, unknown>).myCheckbox = false;
        (c.data as Record<string, unknown>)["myTime"] = "11:00";
        (c.data as Record<string, unknown>).checkOptionSet = {
            _selected: ["option_2"],
            option_2: {
                contentSelector: '5a5fc786-a4e6-4a4d-a21a-19ac6fd4784b'
            }
        };
        return c;
    }

    const contentLib = require('/lib/xp/content');

    const result = contentLib.modify({
        key: '/features/js-libraries/mycontent',
        editor: editor
    });

    if (result) {
        log.info('Content modified. New title is ' + result.displayName);
    } else {
        log.info('Content not found');
    }

    log.info('Modify result: ' + JSON.stringify(result, null, 4));

    return result;
}

export function applyPermissions() {
    const contentLib = require('/lib/xp/content');

    const result = contentLib.applyPermissions({
        key: '/features/js-libraries/mycontent',
        scope: 'TREE',
        permissions: [{
            principal: 'user:system:anonymous',
            allow: ['READ'],
            deny: []
        }]
    });

    if (result) {
        log.info('Content permissions applied.');
    } else {
        log.info('Content not found');
    }

    log.info('ApplyPermissions result: ' + JSON.stringify(result, null, 4));

    return result;
}

export function getPermissions() {
    const contentLib = require('/lib/xp/content');

    const result = contentLib.getPermissions({
        key: '/features/js-libraries/mycontent'
    });

    if (result) {
        log.info('Content permissions: ' + result.permissions);
    } else {
        log.info('Content not found');
    }

    log.info('GetPermissions result: ' + JSON.stringify(result, null, 4));

    return result;
}

export function publish() {
    const contentLib = require('/lib/xp/content');
    const result = contentLib.publish({
        keys: ['/features/js-libraries/mycontent'],
    });
    if (result) {
        log.info('Pushed ' + result.pushedContents.length + " content.");
        log.info('Content that failed operation: ' + result.failedContents.length);
    } else {
        log.info('Operation failed.');
    }
    return result;
}
