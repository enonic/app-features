import * as notifications from '/lib/notifications';
import type {KeyPair, SendParams, SendAsyncParams} from '/lib/notifications';

export interface StoredSubscription {
    id: string;
    label: string;
    endpoint: string;
    auth: string;
    receiverKey: string;
    savedAt: string;
}

interface State {
    keyPair: KeyPair | null;
    subscriptions: StoredSubscription[];
}

const state: State = {
    keyPair: null,
    subscriptions: []
};

export function getKeyPair(): KeyPair {
    if (!state.keyPair) {
        state.keyPair = notifications.generateKeyPair();
    }
    return state.keyPair;
}

export function hasKeyPair(): boolean {
    return state.keyPair != null;
}

export function regenerateKeyPair(): KeyPair {
    state.keyPair = notifications.generateKeyPair();
    state.subscriptions = [];
    return state.keyPair;
}

export function listSubscriptions(): StoredSubscription[] {
    return state.subscriptions.slice();
}

export function getSubscription(id: string): StoredSubscription | null {
    for (let i = 0; i < state.subscriptions.length; i++) {
        if (state.subscriptions[i].id === id) {
            return state.subscriptions[i];
        }
    }
    return null;
}

export function addSubscription(params: {
    endpoint: string;
    auth: string;
    receiverKey: string;
    label?: string;
}): StoredSubscription {
    if (!params.endpoint || !params.auth || !params.receiverKey) {
        throw new Error('endpoint, auth and receiverKey are all required');
    }
    const id = newId();
    const sub: StoredSubscription = {
        id: id,
        label: params.label || ('subscription-' + id),
        endpoint: params.endpoint,
        auth: params.auth,
        receiverKey: params.receiverKey,
        savedAt: new Date().toISOString()
    };
    state.subscriptions.push(sub);
    return sub;
}

export function removeSubscription(id: string): boolean {
    const before = state.subscriptions.length;
    const filtered: StoredSubscription[] = [];
    for (let i = 0; i < state.subscriptions.length; i++) {
        if (state.subscriptions[i].id !== id) {
            filtered.push(state.subscriptions[i]);
        }
    }
    state.subscriptions = filtered;
    return state.subscriptions.length < before;
}

export function clearSubscriptions(): number {
    const n = state.subscriptions.length;
    state.subscriptions = [];
    return n;
}

export interface SendOptions {
    payload?: string | Record<string, unknown>;
}

export interface SendResult {
    id: string;
    label: string;
    status: number;
    error?: string;
}

export function sendToSubscription(id: string, opts?: SendOptions): SendResult {
    const sub = getSubscription(id);
    if (!sub) {
        throw new Error('No subscription with id: ' + id);
    }
    return sendOne(sub, opts || {});
}

export function sendToAll(opts?: SendOptions): SendResult[] {
    const o = opts || {};
    const results: SendResult[] = [];
    for (let i = 0; i < state.subscriptions.length; i++) {
        results.push(sendOne(state.subscriptions[i], o));
    }
    return results;
}

export interface AsyncResult {
    submitted: boolean;
    id: string;
    label: string;
}

export function sendAsyncToSubscription(id: string, opts?: SendOptions): AsyncResult {
    const sub = getSubscription(id);
    if (!sub) {
        throw new Error('No subscription with id: ' + id);
    }
    const pair = getKeyPair();
    const params: SendAsyncParams = {
        publicKey: pair.publicKey,
        privateKey: pair.privateKey,
        endpoint: sub.endpoint,
        auth: sub.auth,
        receiverKey: sub.receiverKey,
        payload: opts && opts.payload,
        success: function (status: number) {
            log.info('sendAsync OK id=%s label=%s status=%s', sub.id, sub.label, status);
        },
        error: function () {
            log.warning('sendAsync FAIL id=%s label=%s', sub.id, sub.label);
        }
    };
    notifications.sendAsync(params);
    return {submitted: true, id: sub.id, label: sub.label};
}

function sendOne(sub: StoredSubscription, opts: SendOptions): SendResult {
    const pair = getKeyPair();
    const params: SendParams = {
        publicKey: pair.publicKey,
        privateKey: pair.privateKey,
        endpoint: sub.endpoint,
        auth: sub.auth,
        receiverKey: sub.receiverKey,
        payload: opts.payload
    };
    try {
        const status = notifications.send(params);
        return {id: sub.id, label: sub.label, status: status};
    } catch (e: any) {
        return {id: sub.id, label: sub.label, status: 0, error: e && e.message ? e.message : String(e)};
    }
}

function newId(): string {
    return Math.random().toString(36).slice(2, 10);
}
