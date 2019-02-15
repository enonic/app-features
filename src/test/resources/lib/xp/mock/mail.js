var sendParams = {};

var mock = {
    send: function (params) {
        sendParams = params;
        return true;
    }
};

exports.sendParams = function () {
    return sendParams;
};

__.registerMock('/lib/xp/mail.js', mock);
