$(function () {

    var pushSupported = ('serviceWorker' in navigator) && ('PushManager' in window);

    // Config lives on the part's root element (data-* attributes) so it stays
    // fresh after each in-place swap — e.g. the VAPID public key changes when
    // the key pair is regenerated.
    function cfg(name) {
        return $('.notifications-part').attr('data-' + name);
    }

    function refreshSupport() {
        var support = $('#notif-support');
        if (!support.length) {
            return;
        }
        if (pushSupported) {
            support.text('Push API available in this browser.');
        } else {
            support.text('Browser has no service worker or push support.');
            $('#notif-subscribe').prop('disabled', true);
        }
    }

    function replacePart(resp) {
        $('.notifications-part').replaceWith($(resp));
        refreshSupport();
    }

    // Keep the part's form POSTs (regenerate keys, remove, send) on the page:
    // submit them via AJAX to the component URL and swap the rendered part in
    // place, instead of the browser navigating to the bare component URL.
    function actionOf(data) {
        for (var i = 0; i < data.length; i++) {
            if (data[i].name === 'action') {
                return data[i].value;
            }
        }
        return '';
    }

    $(document).on('submit', '.notifications-part form', function (e) {
        e.preventDefault();
        var form = $(this);
        var data = form.serializeArray();
        var submitter = e.originalEvent && e.originalEvent.submitter;
        if (submitter && submitter.name) {
            data.push({name: submitter.name, value: submitter.value});
        }
        // send / sendAsync change nothing visible (no status is rendered), so
        // fire and forget; list-changing actions swap the re-rendered part.
        var action = actionOf(data);
        var isSend = (action === 'send' || action === 'sendAsync');
        $.ajax({
            url: form.attr('action') || cfg('post-url'),
            method: 'POST',
            data: $.param(data)
        }).done(function (resp) {
            if (!isSend) {
                replacePart(resp);
            }
        });
    });

    // Subscribe via the Push API, then persist the subscription. Delegated so it
    // survives the in-place swaps above, and reads the current VAPID key.
    $(document).on('click', '#notif-subscribe', function () {
        if (!pushSupported) {
            return;
        }
        var subscribeBtn = $(this);
        var publicKey = cfg('public-key');
        var swUrl = cfg('sw-url');
        var postUrl = cfg('post-url');
        if (!publicKey) {
            return; // no key pair generated yet
        }
        subscribeBtn.prop('disabled', true);
        navigator.serviceWorker.register(swUrl).then(function (registration) {
            // pushManager.subscribe() needs an ACTIVE worker. On the first
            // registration the worker is still installing/activating (and our
            // asset-scoped worker doesn't control the page, so serviceWorker.ready
            // won't fire), which is why the first click used to fail. Wait for it.
            return waitForActiveWorker(registration);
        }).then(function (registration) {
            return registration.pushManager.getSubscription().then(function (existing) {
                // A subscription created with a different VAPID key can't be sent
                // to (the push service returns 403), so drop any existing one and
                // re-subscribe with the current server key.
                return (existing ? existing.unsubscribe() : Promise.resolve()).then(function () {
                    return registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(publicKey)
                    });
                });
            });
        }).then(function (sub) {
            var json = sub.toJSON();
            $.ajax({
                url: postUrl,
                method: 'POST',
                data: {
                    action: 'subscribe',
                    endpoint: json.endpoint,
                    auth: json.keys && json.keys.auth,
                    p256dh: json.keys && json.keys.p256dh
                }
            }).done(replacePart);
        }).catch(function (err) {
            subscribeBtn.prop('disabled', false);
            $('#notif-support').text('Subscription failed: ' + (err && err.message ? err.message : err));
        });
    });

    refreshSupport();

    // Resolve once the registration has an active service worker, so that
    // pushManager.subscribe() does not fail with "no active Service Worker".
    function waitForActiveWorker(registration) {
        if (registration.active) {
            return Promise.resolve(registration);
        }
        return new Promise(function (resolve) {
            var worker = registration.installing || registration.waiting;
            if (!worker || worker.state === 'activated') {
                resolve(registration);
                return;
            }
            worker.addEventListener('statechange', function () {
                if (worker.state === 'activated') {
                    resolve(registration);
                }
            });
        });
    }

    function urlBase64ToUint8Array(base64String) {
        var padding = '='.repeat((4 - base64String.length % 4) % 4);
        var base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        var rawData = window.atob(base64);
        var outputArray = new Uint8Array(rawData.length);
        for (var i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

});
