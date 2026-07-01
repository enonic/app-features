import type {Request} from '@enonic-types/core';
import * as store from '/lib/notifications-store';

interface ApiResponse {
    status: number;
    contentType: string;
    body: Record<string, unknown>;
}

export const GET = function (req: Request): ApiResponse {
    return dispatch(req, 'GET');
};

export const POST = function (req: Request): ApiResponse {
    return dispatch(req, 'POST');
};

export const DELETE = function (req: Request): ApiResponse {
    return dispatch(req, 'DELETE');
};

function dispatch(req: Request, method: string): ApiResponse {
    const body = readBody(req);
    const action = String(req.params.action || body.action || '');
    try {
        if (method === 'GET' && (action === '' || action === 'status')) {
            return ok({
                hasKeyPair: store.hasKeyPair(),
                subscriptionCount: store.listSubscriptions().length
            });
        }
        if (method === 'GET' && action === 'key') {
            const pair = store.getKeyPair();
            return ok({publicKey: pair.publicKey, privateKeyPresent: typeof pair.privateKey === 'string' && pair.privateKey.length > 0});
        }
        if (method === 'GET' && action === 'list') {
            return ok({subscriptions: store.listSubscriptions()});
        }
        if (method === 'POST' && action === 'regenerate') {
            const pair = store.regenerateKeyPair();
            return ok({publicKey: pair.publicKey, cleared: true});
        }
        if (method === 'POST' && action === 'subscribe') {
            const sub = store.addSubscription({
                endpoint: stringOf(body.endpoint || req.params.endpoint),
                auth: stringOf(body.auth || req.params.auth),
                receiverKey: stringOf(body.p256dh || body.receiverKey || req.params.p256dh || req.params.receiverKey),
                label: optionalString(body.label || req.params.label)
            });
            return ok({subscription: sub, total: store.listSubscriptions().length});
        }
        if (method === 'POST' && action === 'unsubscribe') {
            const id = stringOf(body.id || req.params.id);
            const removed = store.removeSubscription(id);
            return ok({removed: removed, id: id, remaining: store.listSubscriptions().length});
        }
        if (method === 'DELETE' && (action === '' || action === 'subscriptions')) {
            const cleared = store.clearSubscriptions();
            return ok({cleared: cleared});
        }
        if (method === 'POST' && action === 'send') {
            const id = stringOf(body.id || req.params.id);
            const result = store.sendToSubscription(id, parsePayloadOpts(body, req));
            return ok({result: result});
        }
        if (method === 'POST' && action === 'sendAsync') {
            const id = stringOf(body.id || req.params.id);
            const r = store.sendAsyncToSubscription(id, parsePayloadOpts(body, req));
            return ok({async: r});
        }
        if (method === 'POST' && action === 'sendAll') {
            const results = store.sendToAll(parsePayloadOpts(body, req));
            return ok({results: results, sent: results.length});
        }
        return jsonError(404, 'Unknown action: ' + method + ' /' + action);
    } catch (e: any) {
        const msg = e && e.message ? e.message : String(e);
        return jsonError(400, msg);
    }
}

function readBody(req: Request): Record<string, unknown> {
    const raw = req.body;
    if (raw && typeof raw === 'string') {
        const trimmed = raw.replace(/^\s+/, '');
        if (trimmed.charAt(0) === '{' || trimmed.charAt(0) === '[') {
            try {
                const parsed = JSON.parse(trimmed);
                if (parsed && typeof parsed === 'object') {
                    return parsed as Record<string, unknown>;
                }
            } catch (e) {
                // fall through; not JSON
            }
        }
    }
    return {};
}

function parsePayloadOpts(body: Record<string, unknown>, req: Request): store.SendOptions {
    if (body.payload !== undefined && body.payload !== null) {
        return {payload: body.payload as string | Record<string, unknown>};
    }
    const paramPayload = req.params.payload;
    if (paramPayload !== undefined && paramPayload !== null && paramPayload !== '') {
        const s = String(paramPayload);
        if (s.charAt(0) === '{' || s.charAt(0) === '[') {
            try {
                return {payload: JSON.parse(s) as Record<string, unknown>};
            } catch (e) {
                return {payload: s};
            }
        }
        return {payload: s};
    }
    return {};
}

function stringOf(v: unknown): string {
    return v == null ? '' : String(v);
}

function optionalString(v: unknown): string | undefined {
    if (v == null) {
        return undefined;
    }
    const s = String(v);
    return s.length > 0 ? s : undefined;
}

function ok(data: Record<string, unknown>): ApiResponse {
    return {
        status: 200,
        contentType: 'application/json',
        body: data
    };
}

function jsonError(status: number, message: string): ApiResponse {
    return {
        status: status,
        contentType: 'application/json',
        body: {error: message}
    };
}
