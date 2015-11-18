var portal = require('/lib/xp/portal');

function handleReq(req) {

    log.info('REQUEST: %s', req);

    return {
        contentType: 'application/json',
        body: req
    }
}

exports.get = handleReq;
exports.post = handleReq;
exports.put = handleReq;
exports.patch = handleReq;
exports.delete = handleReq;
exports.head = handleReq;
exports.options = handleReq;