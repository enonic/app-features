import * as websocketLib from '/lib/xp/websocket';
import type {Request, WebSocketEvent} from '@enonic-types/core';
import {registerWsSession, unregisterWsSession} from '/lib/cron-broadcaster';

export const GET = function (req: Request) {
    if (!req.webSocket) {
        return {
            status: 426,
            contentType: 'text/plain',
            body: 'Cron WebSocket endpoint. Connect over ws(s):// to receive scheduled tick events.'
        };
    }
    return {
        webSocket: {
            data: {mode: 'cron-tick'},
            terminateOnSessionExit: false
        }
    };
};

export const webSocketEvent = function (event: WebSocketEvent<{mode: string}>): void {
    if (event.type === 'open') {
        registerWsSession(event.session.id);
        websocketLib.send(event.session.id, JSON.stringify({event: 'connected', sessionId: event.session.id}));
    } else if (event.type === 'close' || event.type === 'error') {
        unregisterWsSession(event.session.id);
    }
};
