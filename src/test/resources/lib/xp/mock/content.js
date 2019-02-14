var getJson = {};
var queryJson = {};

var mock = {
    get: function (params) {
        return getJson;
    },

    delete: function (params) {
        return {}
    },

    getChildren: function (params) {
        return {}
    },

    create: function (params) {
        return {}
    },

    query: function (params) {
        return queryJson;
    },

    modify: function (params) {
        return {}
    }
};

exports.mockGet = function (json) {
    getJson = json;
};

exports.mockQuery = function (json) {
    queryJson = json;
};

__.registerMock('/site/lib/xp/content.js', mock);
