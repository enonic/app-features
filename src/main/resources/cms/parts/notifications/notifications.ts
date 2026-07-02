import * as portal from '/lib/xp/portal';
import * as thymeleaf from '/lib/thymeleaf';
import {assetUrl} from '/lib/enonic/asset';
import type {Request} from '@enonic-types/core';
import * as store from '/lib/notifications-store';

const DEFAULT_MESSAGE = 'Hello from app-features';

export const GET = function (req: Request) {
    return render(req);
};

export const POST = function (req: Request) {
    const action = String(req.params.action || '');

    // Send actions answer with the real push-service status (as the response
    // status + a small JSON body), so the outcome is visible on the POST in
    // dev tools instead of being hidden behind a re-render.
    if (action === 'send' || action === 'sendAsync') {
        return sendResponse(req, action);
    }

    // Key / subscription changes re-render the part; no status is surfaced.
    try {
        if (action === 'generateKeys') {
            store.generateKeyPair();
        } else if (action === 'subscribe') {
            store.addSubscription({
                endpoint: String(req.params.endpoint || ''),
                auth: String(req.params.auth || ''),
                receiverKey: String(req.params.p256dh || ''),
                label: req.params.label ? String(req.params.label) : undefined
            });
        } else if (action === 'unsubscribe') {
            const id = String(req.params.id || '');
            if (id) {
                store.removeSubscription(id);
            } else {
                store.clearSubscriptions();
            }
        }
    } catch (e) {
        // swallow — list-changing actions re-render regardless
    }

    return render(req);
};

function sendResponse(req: Request, action: string) {
    const id = String(req.params.id || '');
    if (!id || !store.getSubscription(id)) {
        return json(404, {error: 'No subscription with id ' + id});
    }
    const opts = {payload: String(req.params.message || DEFAULT_MESSAGE)};
    try {
        if (action === 'sendAsync') {
            // sendAsync returns immediately; the push outcome is logged server-side.
            return json(202, store.sendAsyncToSubscription(id, opts));
        }
        const r = store.sendToSubscription(id, opts);
        const status = (r.status >= 100 && r.status < 600) ? r.status : 502;
        return json(status, r);
    } catch (e: any) {
        return json(500, {error: e && e.message ? e.message : String(e)});
    }
}

function json(status: number, body: unknown) {
    return {
        status: status,
        contentType: 'application/json',
        body: JSON.stringify(body)
    };
}

function render(req: Request) {
    const pair = store.getKeyPair();
    const subscriptions = store.listSubscriptions();

    const params = {
        postUrl: portal.componentUrl({}),
        hasKeyPair: pair != null,
        publicKey: pair ? pair.publicKey : '',
        privateKeyPreview: pair ? pair.privateKey.substring(0, 8) + '…' : '',
        subscriptions: subscriptions,
        subscriptionsJson: JSON.stringify(subscriptions, null, 2),
        hasSubscriptions: subscriptions.length > 0,
        subscriptionCount: subscriptions.length,
        defaultMessage: DEFAULT_MESSAGE,
        swUrl: assetUrl({path: 'js/parts/notifications/sw.js'})
    };

    const view = resolve('notifications.html');
    const body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body,
        pageContributions: {
            bodyEnd: [
                '<script src="' + assetUrl({path: 'js/jquery-2.1.4.min.js'}) + '" type="text/javascript"></script>',
                '<script src="' + assetUrl({path: 'js/parts/notifications/notifications.js'}) + '" type="text/javascript"></script>'
            ]
        }
    };
}
