exports.filter = function (req, next) {
    var before = new Date().getTime();
    var result = next(req);
    var after = new Date().getTime();
    log.info((after - before) + 'ms');
    return result;
};