exports.get = function (req) {
    return {
        contentType: 'application/json',
        body: JSON.stringify(req)
    };
}