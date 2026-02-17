exports.filter = function (req, next) {
    var before = new Date().getTime();
    var result = next(req);
    /* normal request processing */
    var after = new Date().getTime();
    log.info((after - before) + 'ms');
    return result;
};
