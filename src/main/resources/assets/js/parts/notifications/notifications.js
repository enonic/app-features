$(function () {

    var support = $('#notif-support');
    var subscribeBtn = $('#notif-subscribe');
    var postUrl = $('meta[name="notifications-post-url"]').attr('content');
    var publicKey = $('meta[name="vapid-public-key"]').attr('content');

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        if (support.length) {
            support.text('Browser has no service worker or push support.');
        }
        if (subscribeBtn.length) {
            subscribeBtn.prop('disabled', true);
        }
        return;
    }

    if (subscribeBtn.length) {
        support.text('Push API available in this browser.');
        subscribeBtn.on('click', function () {
            subscribeBtn.prop('disabled', true);
            navigator.serviceWorker.register('sw.js').then(function (registration) {
                return registration.pushManager.getSubscription().then(function (existing) {
                    if (existing) {
                        return existing;
                    }
                    return registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(publicKey)
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
                }).done(function (resp) {
                    $('.notifications-part').replaceWith($(resp));
                });
            }).catch(function (err) {
                subscribeBtn.prop('disabled', false);
                support.text('Subscription failed: ' + (err && err.message ? err.message : err));
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
