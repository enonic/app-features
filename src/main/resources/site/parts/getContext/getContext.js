var contextLib = require('/lib/xp/context');
var thymeleaf = require('/lib/thymeleaf');
var view = resolve('getContext.html');

function handleGet(req) {

    var context = contextLib.get();

    var contextString = JSON.stringify(context);

    var executed = contextLib.run( context, callback );

    var params = {
        context: context,
        executedResult: executed
    };

    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}

function callback() {
    return 'Hello from context';
}

exports.get = handleGet;