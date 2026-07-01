import * as websocketLib from '/lib/xp/websocket';

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

interface Registry {
    registerSse(clientId: string): void;
    unregisterSse(clientId: string): void;
    listSse(): string[];
    countSse(): number;
    registerWs(sessionId: string): void;
    unregisterWs(sessionId: string): void;
    listWs(): string[];
    countWs(): number;
    nextTick(): number;
    currentTick(): number;
    resetTick(): void;
}

const sseLib = require('/lib/xp/sse') as SseLib;
const registry = __.newBean<Registry>('com.enonic.xp.sample.features.CronClientRegistry');

export function registerSseClient(clientId: string): void {
    registry.registerSse(clientId);
}

export function unregisterSseClient(clientId: string): void {
    registry.unregisterSse(clientId);
}

export function registerWsSession(sessionId: string): void {
    registry.registerWs(sessionId);
}

export function unregisterWsSession(sessionId: string): void {
    registry.unregisterWs(sessionId);
}

export function sseClientCount(): number {
    return registry.countSse();
}

export function wsSessionCount(): number {
    return registry.countWs();
}

export function nextTickNumber(): number {
    return registry.nextTick();
}

export function resetTickCounter(): void {
    registry.resetTick();
}

export function broadcastTick(source: string): { count: number; timestamp: string; sseSent: number; wsSent: number } {
    const count = registry.nextTick();
    const timestamp = new Date().toISOString();
    const payload = JSON.stringify({source, count, timestamp});
    let sseSent = 0;
    const sseClients = registry.listSse();
    for (let i = 0; i < sseClients.length; i++) {
        const clientId = sseClients[i];
        if (sseLib.isOpen({clientId})) {
            sseLib.send({clientId, message: {event: 'tick', data: payload}});
            sseSent++;
        } else {
            registry.unregisterSse(clientId);
        }
    }
    let wsSent = 0;
    const wsSessions = registry.listWs();
    for (let i = 0; i < wsSessions.length; i++) {
        const sessionId = wsSessions[i];
        try {
            websocketLib.send(sessionId, payload);
            wsSent++;
        } catch (e) {
            registry.unregisterWs(sessionId);
        }
    }
    log.info('cron tick #%s from %s to %s SSE / %s WS clients', String(count), source, String(sseSent), String(wsSent));
    return {count, timestamp, sseSent, wsSent};
}
