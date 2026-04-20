import * as taskLib from '/lib/xp/task';

interface SseMessage {
    id?: string;
    event?: string;
    data?: string;
    comment?: string;
}

interface SseLib {
    send(params: { clientId: string; message: SseMessage }): void;

    close(params: { clientId: string }): void;

    isOpen(params: { clientId: string }): boolean;
}

const sseLib = require('/lib/xp/sse') as SseLib;

const MESSAGES = [
    'Thinking...',
    'Loading...',
    'Working...',
    'Almost there...',
    'Done!'
];

export function getResponse() {
    return {sse: {}};
}

export function handleEvent(event: { type: string; clientId: string }, descriptionPrefix: string): void {
    if (event.type !== 'open') {
        return;
    }
    const clientId = event.clientId;
    sseLib.send({clientId, message: {event: 'message', data: 'Hello!'}});
    taskLib.executeFunction({
        description: descriptionPrefix + clientId,
        func: function () {
            for (let i = 0; i < MESSAGES.length && sseLib.isOpen({clientId}); i++) {
                taskLib.sleep(1000);
                sseLib.send({clientId, message: {event: 'message', data: MESSAGES[i]}});
            }
            sseLib.close({clientId});
        }
    });
}
