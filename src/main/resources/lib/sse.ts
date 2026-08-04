import * as taskLib from '/lib/xp/task';

interface SseMessage {
    id?: string;
    event?: string;
    data?: string;
    comment?: string;
}

interface SseLib {
    send(params: { clientId: string; message: SseMessage }): void;
}

const sseLib = require('/lib/xp/sse') as SseLib;

export function getResponse() {
    return {sse: {}};
}

export function handleEvent(event: { type: string; clientId: string }, descriptionPrefix: string): void {
    if (event.type !== 'open') {
        return;
    }
    const clientId = event.clientId;
    sseLib.send({clientId, message: {event: 'message', data: 'Hello!'}});
    taskLib.submitTask({
        descriptor: 'sse-drip',
        config: {clientId, descriptionPrefix}
    });
}
