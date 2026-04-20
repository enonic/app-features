import * as websocket from '/lib/xp/websocket';
import * as thymeleaf from '/lib/thymeleaf';
import type {Request, WebSocketEvent} from '@enonic-types/core';

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

export const GET = function (req: Request) {
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

export const webSocketEvent = function (event: WebSocketEvent<Record<string, unknown>>) {
    if (event.type == 'open') {
        websocket.addToGroup('chat', event.session.id);
    }

    if (event.type == 'message') {
        websocket.sendToGroup('chat', event.message);
    }
};
