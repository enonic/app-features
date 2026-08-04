import * as taskLib from '/lib/xp/task';

interface SseLib {
    send(params: { clientId: string; message: { event?: string; data?: string } }): void;

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

interface SseDripConfig {
    clientId: string;
    descriptionPrefix: string;
}

export function run(config: SseDripConfig): void {
    const {clientId, descriptionPrefix} = config;
    log.info('SSE drip started: ' + descriptionPrefix + clientId);
    for (let i = 0; i < MESSAGES.length && sseLib.isOpen({clientId}); i++) {
        taskLib.sleep(1000);
        sseLib.send({clientId, message: {event: 'message', data: MESSAGES[i]}});
    }
    sseLib.close({clientId});
}
