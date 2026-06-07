import type {Request} from '@enonic-types/core';
import {handleEvent} from '/lib/ws-demo';

export const GET = function (req: Request) {
    if (!req.webSocket) {
        return {
            status: 426,
            contentType: 'text/plain',
            body: 'Public WebSocket endpoint. Connect over ws(s)://'
        };
    }

    return {
        webSocket: {
            data: {mode: 'public'},
            terminateOnSessionExit: false
        }
    };
};

export const webSocketEvent = handleEvent;
