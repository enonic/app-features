var clusterLib = require('/lib/xp/cluster');
var thymeleaf = require('/lib/thymeleaf');
var view = resolve('js-libraries-cluster.html');

function handleGet(req) {
    var params = {
        isMaster: clusterLib.isMaster()
    };

    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

exports.get = handleGet;