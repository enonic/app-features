(function () {
    function report(id, ok, text) {
        var el = document.getElementById(id);
        if (!el) {
            return;
        }
        el.textContent = text;
        el.className = ok ? 'ok' : 'blocked';
    }

    function run() {
        report('inline-plain', window.inlineRan !== true, window.inlineRan ? 'ran (unexpected)' : 'blocked (expected)');
        report('inline-nonce', window.nonceRan === true, window.nonceRan ? 'ran (expected)' : 'blocked (unexpected)');
        report('processor-script', window.processorScriptRan === true, window.processorScriptRan ? 'ran (expected)' : 'missing (unexpected)');

        var styled = document.getElementById('inline-style');
        var color = window.getComputedStyle(styled).color;
        report('inline-style', color !== 'rgb(255, 0, 0)', color === 'rgb(255, 0, 0)' ? 'applied (unexpected)' : 'blocked (expected)');

        var img = document.getElementById('csp-data-image');
        if (!img) {
            report('data-image', true, 'csp-image part not on page, nothing to load');
        } else {
            var settle = function () {
                var loaded = img.complete && img.naturalWidth > 0;
                report('data-image', loaded, loaded ? 'loaded (expected with part)' : 'blocked (unexpected with part)');
            };
            if (img.complete) {
                settle();
            } else {
                img.addEventListener('load', settle);
                img.addEventListener('error', settle);
            }
        }

        fetch(window.location.href, {credentials: 'same-origin'}).then(function (response) {
            document.getElementById('header-csp').textContent = response.headers.get('Content-Security-Policy') || '(none)';
            document.getElementById('header-csp-ro').textContent = response.headers.get('Content-Security-Policy-Report-Only') || '(none)';
        }).catch(function (e) {
            document.getElementById('header-csp').textContent = 'fetch failed: ' + e;
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }
})();
