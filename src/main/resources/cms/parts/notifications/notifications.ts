import * as portal from '/lib/xp/portal';
import * as thymeleaf from '/lib/thymeleaf';
import {assetUrl} from '/lib/enonic/asset';
import type {Request} from '@enonic-types/core';
import * as store from '/lib/notifications-store';
import type {SendResult} from '/lib/notifications-store';

export const GET = function (req: Request) {
    return render(req);
};

export const POST = function (req: Request) {
    const action = String(req.params.action || '');
    const state: RenderState = {};

    try {
        if (action === 'regenerateKeys') {
            store.regenerateKeyPair();
            state.infoMsg = 'New VAPID key pair generated. Existing subscriptions cleared.';
        } else if (action === 'subscribe') {
            const sub = store.addSubscription({
                endpoint: String(req.params.endpoint || ''),
                auth: String(req.params.auth || ''),
                receiverKey: String(req.params.p256dh || ''),
                label: req.params.label ? String(req.params.label) : undefined
            });
            state.infoMsg = 'Subscription stored: ' + sub.label;
        } else if (action === 'subscribeFake') {
            const label = req.params.label ? String(req.params.label) : 'fake-' + Math.random().toString(36).slice(2, 6);
            const sub = store.addSubscription({
                endpoint: 'https://push.invalid/' + label,
                auth: 'fake-auth-' + label,
                receiverKey: fakeReceiverKey(),
                label: label
            });
            state.infoMsg = 'Fake subscription added (label=' + sub.label + ', id=' + sub.id + ')';
        } else if (action === 'unsubscribe') {
            const id = String(req.params.id || '');
            if (id) {
                const removed = store.removeSubscription(id);
                state.infoMsg = removed ? 'Subscription removed.' : 'No subscription with id ' + id;
            } else {
                const cleared = store.clearSubscriptions();
                state.infoMsg = 'Cleared ' + cleared + ' subscription(s).';
            }
        } else if (action === 'send' || action === 'sendAsync' || action === 'sendAll') {
            if (store.listSubscriptions().length === 0) {
                state.errorMsg = 'No subscription on file. Click "Subscribe" first.';
            } else {
                const opts = parsePayload(req);
                if (action === 'sendAll') {
                    state.sendResults = store.sendToAll(opts);
                    state.infoMsg = 'sendAll() invoked for ' + state.sendResults.length + ' subscription(s).';
                } else {
                    const id = String(req.params.id || (store.listSubscriptions()[0] && store.listSubscriptions()[0].id));
                    if (action === 'send') {
                        const r = store.sendToSubscription(id, opts);
                        state.sendResults = [r];
                        state.infoMsg = 'send() returned status ' + r.status + (r.error ? ' (' + r.error + ')' : '');
                    } else {
                        const r = store.sendAsyncToSubscription(id, opts);
                        state.sendAsyncSubmitted = true;
                        state.infoMsg = 'sendAsync() submitted for ' + r.label + '; result is logged on the server.';
                    }
                }
            }
        }
    } catch (e: any) {
        state.errorMsg = 'Error: ' + (e && e.message ? e.message : String(e));
    }

    return render(req, state);
};

interface RenderState {
    infoMsg?: string;
    errorMsg?: string;
    sendResults?: SendResult[];
    sendAsyncSubmitted?: boolean;
}

function render(req: Request, state: RenderState = {}) {
    const pair = store.getKeyPair();
    const postUrl = portal.componentUrl({});
    const subscriptions = store.listSubscriptions();

    const params = {
        postUrl: postUrl,
        publicKey: pair.publicKey,
        publicKeyPreview: pair.publicKey.length > 24 ? pair.publicKey.substring(0, 24) + '…' : pair.publicKey,
        privateKeyPreview: pair.privateKey.substring(0, 8) + '…',
        subscriptions: subscriptions,
        subscriptionsJson: JSON.stringify(subscriptions, null, 2),
        hasSubscriptions: subscriptions.length > 0,
        subscriptionCount: subscriptions.length,
        sendResults: state.sendResults,
        sendAsyncSubmitted: state.sendAsyncSubmitted,
        infoMsg: state.infoMsg,
        errorMsg: state.errorMsg,
        defaultMessage: 'Hello from app-features'
    };

    const view = resolve('notifications.html');
    const body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body,
        pageContributions: {
            headEnd: [
                '<meta name="vapid-public-key" content="' + pair.publicKey + '"/>',
                '<meta name="notifications-post-url" content="' + postUrl + '"/>'
            ],
            bodyEnd: [
                '<script src="' + assetUrl({path: 'js/jquery-2.1.4.min.js'}) + '" type="text/javascript"></script>',
                '<script src="' + assetUrl({path: 'js/parts/notifications/notifications.js'}) + '" type="text/javascript"></script>'
            ]
        }
    };
}

function parsePayload(req: Request): store.SendOptions {
    const variant = String(req.params.payloadVariant || 'string');
    const message = String(req.params.message || 'Hello from app-features');
    if (variant === 'empty') {
        return {};
    }
    if (variant === 'rich') {
        return {
            payload: {
                title: 'app-features',
                body: message,
                icon: '/icons/app-features.png',
                sender: 'app-features',
                tag: 'demo'
            }
        };
    }
    if (variant === 'object') {
        return {payload: {message: message, sender: 'app-features'}};
    }
    return {payload: message};
}

function fakeReceiverKey(): string {
    let s = '';
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 65; i++) {
        s += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    return 'B' + s;
}

