exports.get = function (req) {
    return {
        body: 'Hello ' + (req.params.name || 'World'),
        contentType: 'text/plain'
    };
};
