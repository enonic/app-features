import type {Request} from '@enonic-types/core';
import {handleEvent} from '/lib/ws-demo';

interface SessionParams {
    terminateOnSessionExit?: boolean;
    sessionAccess?: boolean;
    sessionAccessThrottleMs?: number;
}

const MODES: Record<string, SessionParams> = {
    'default': {},
    'survivor': {terminateOnSessionExit: false},
    'keepalive': {sessionAccess: true, sessionAccessThrottleMs: 10000}
};

export const GET = function (req: Request) {
    if (!req.webSocket) {
        return {
            status: 426,
            contentType: 'text/plain',
            body: 'WebSocket endpoint. Connect over ws(s):// with an optional ?mode=default|survivor|keepalive'
        };
    }

    const requested = req.params.mode;
    const mode = typeof requested === 'string' && requested in MODES ? requested : 'default';

    return {
        webSocket: {
            data: {mode: mode},
            ...MODES[mode]
        }
    };
};

export const webSocketEvent = handleEvent;
