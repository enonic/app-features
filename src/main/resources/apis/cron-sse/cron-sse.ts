import {registerSseClient, unregisterSseClient} from '/lib/cron-broadcaster';

interface SseLib {
    send(params: {clientId: string; message: {event?: string; data?: string}}): void;
    isOpen(params: {clientId: string}): boolean;
}

const sseLib = require('/lib/xp/sse') as SseLib;

export const GET = function () {
    return {sse: {}};
};

export const sseEvent = function (event: {type: string; clientId: string}): void {
    if (event.type === 'open') {
        registerSseClient(event.clientId);
        if (sseLib.isOpen({clientId: event.clientId})) {
            sseLib.send({clientId: event.clientId, message: {event: 'connected', data: event.clientId}});
        }
    } else if (event.type === 'close') {
        unregisterSseClient(event.clientId);
    }
};
