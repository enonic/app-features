var portal = require('/lib/xp/portal');
var contentLib = require('/lib/xp/content');
var contextLib = require('/lib/xp/context');

function handleGet(req) {

    createContent('defaultcontent');
    publishContent('defaultcontent');

    var now = new Date()
    createContent('content');
    publishContent('content', now.toISOString());

    var soon = new Date();
    soon.setMinutes(soon.getMinutes() + 30);
    createContent('soonContent');
    publishContent('soonContent', soon.toISOString());

    createContent('onlinecontent');
    publishContent('onlinecontent', '2016-01-01T00:00:00Z', '2018-01-01T00:00:00Z');
    contentLib.modify({
        key: '/onlinecontent',
        branch: 'master',
        editor: function (c) {
            c.publish.to = '2018-02-01T00:00:00Z';
            return c;
        }
    });

    createContent('expiredcontent');
    publishContent('expiredcontent', '2016-01-01T00:00:00Z', '2016-12-01T00:00:00Z');

    createContent('pendingcontent');
    publishContent('pendingcontent', '2018-01-01T00:00:00Z', '2019-01-01T00:00:00Z');


    //try {
    //    contentLib.delete({
    //        key: '/expiredcontent',
    //        branch: 'master'
    //    });
    //} catch (e) {
    //    log.info('Exception on deleting expired content: ' + e);
    //}


    var queryResult = contentLib.query({
        start: 0,
        count: -1,
        query: "displayName = 'My Content'"
    });
    var queryIncludeScheduledResult = contextLib.run({
        attributes: {
            'includeScheduledPublished': true
        }
    }, function () {
        return contentLib.query({
            start: 0,
            count: -1,
            query: "displayName = 'My Content'"
        })
    });

    createContent('incorrectTimesContent');
    try {
        publishContent('incorrectTimesContent', '2017-01-01T00:00:00Z', '2016-01-01T00:00:00Z');
    } catch (e) {
        log.info('Exception on publish content with incorrect publish times: ' + e);
    }


    deleteAndPublishContent('defaultcontent');
    deleteAndPublishContent('content');
    deleteAndPublishContent('soonContent');
    deleteAndPublishContent('onlinecontent');
    deleteAndPublishContent('expiredcontent');
    deleteAndPublishContent('pendingcontent');
    deleteAndPublishContent('incorrectTimesContent');

    return {
        contentType: 'application/json',
        body: {
            queryResult: queryResult,
            queryIncludeScheduledResult: queryIncludeScheduledResult
        }
    };
}

function createContent(name) {
    contentLib.create({
        name: name,
        parentPath: '/',
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
}

function publishContent(name, from, to) {
    contentLib.publish({
        keys: ['/' + name],
        sourceBranch: 'draft',
        targetBranch: 'master',
        schedule: from ? {
            from: from,
            to: to ? to : undefined
        } : undefined
    });
}

function deleteAndPublishContent(name) {
    contentLib.delete({
        key: '/' + name,
        branch: 'draft'
    });
    contentLib.publish({
        keys: ['/' + name],
        sourceBranch: 'draft',
        targetBranch: 'master'
    });
}

exports.get = handleGet;