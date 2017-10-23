var assert = require('/lib/xp/testing');
var portalMock = require('/lib/xp/mock/portal');
var contentMock = require('/lib/xp/mock/content');

exports.testGet = function () {

    portalMock.mockSite({});
    portalMock.mockSiteConfig({});
    contentMock.mockGet({
        _id: '1234'
    });

    var controller = require('./content');
    var result = controller.get({
        params: {
            contentId: '1234'
        }
    });

    assert.assertEquals('text/html', result.contentType);
    assert.assertNotNull(result.body);

};
