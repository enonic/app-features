var siteJson = {};
var siteConfigJson = {};
var contentJson = {};
var componentJson = {};

function createUrl(name, params) {
    return name + "/" + JSON.stringify(params);
}

var mock = {
    assetUrl: function (params) {
        return createUrl('asset', params);
    },

    imageUrl: function (params) {
        return createUrl('image', params);
    },

    componentUrl: function (params) {
        return createUrl('component', params);
    },

    attachmentUrl: function (params) {
        return createUrl('attachment', params);
    },

    pageUrl: function (params) {
        return createUrl('page', params);
    },

    serviceUrl: function (params) {
        return createUrl('service', params);
    },

    processHtml: function (params) {
        return 'process-' + JSON.stringify(params);
    },

    getSite: function () {
        return siteJson;
    },

    getSiteConfig: function () {
        return siteConfigJson;
    },

    getContent: function () {
        return contentJson;
    },

    getComponent: function () {
        return componentJson;
    }
};

exports.mockSite = function (json) {
    siteJson = json;
};

exports.mockSiteConfig = function (json) {
    siteConfigJson = json;
};

exports.mockContent = function (json) {
    contentJson = json;
};

exports.mockComponent = function (json) {
    componentJson = json;
};

__.registerMock('/lib/xp/portal.js', mock);
