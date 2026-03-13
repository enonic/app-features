import * as websocket from '/lib/xp/websocket';
const thymeleaf = require('/lib/thymeleaf') as any;

function renderView() {
    const view = resolve('./chat.html');
    const model = {};
    const body = thymeleaf.render(view, model);

    return {
        status: 200,
        contentType: 'text/html',
        body: body
    };
}

export const GET = function(req: any) {
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

export const webSocketEvent = function(event: any) {
    if (event.type == 'open') {
        websocket.addToGroup('chat', event.session.id);
    }

    if (event.type == 'message') {
        websocket.sendToGroup('chat', event.message);
    }
};
