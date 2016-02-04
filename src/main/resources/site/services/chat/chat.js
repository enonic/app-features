var websocket = require('/lib/xp/websocket');
var thymeleaf = require('/lib/xp/thymeleaf');

function renderView() {
    var view = resolve('./chat.html');
    var model = {};
    var body = thymeleaf.render(view, model);

    return {
        status: 200,
        contentType: 'text/html',
        body: body
    };
}

exports.get = function (req) {

    if (!req.webSocket) {
        return renderView();
    }

    return {
        webSocket: {
            data: {
                user: "test"
            },
            subProtocols: ["text"]
        }
    };
};

exports.webSocketEvent = function (event) {

    if (event.type == 'open') {
        websocket.addToGroup('chat', event.session.id);
    }

    if (event.type == 'message') {
        websocket.sendToGroup('chat', event.message);
    }

};
