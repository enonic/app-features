exports.responseProcessor = function (req, res) {

    res.headers['X-XP-App'] = app.name;

    return res;
};
