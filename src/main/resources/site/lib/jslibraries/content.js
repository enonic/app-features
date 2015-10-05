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
        key: '/features/js-libraries/mycontent'
    });
    //Documentation END

    log.info('Get result: ' + JSON.stringify(result, null, 4));

    return result;
};
