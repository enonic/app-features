import * as websocket from '/lib/xp/websocket';
import type {WebSocketEvent} from '@enonic-types/core';

export function handleEvent(event: WebSocketEvent<{mode: string}>): void {
    if (event.type === 'open') {
        const user = event.session.user ? event.session.user.key : 'anonymous';
        websocket.send(event.session.id, 'connected, mode=' + event.data.mode + ', user=' + user);

    } else if (event.type === 'message') {
        websocket.send(event.session.id, 'echo: ' + event.message);
    }
}
