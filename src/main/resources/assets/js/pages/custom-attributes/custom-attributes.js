(function () {
    var PREFIX = 'custom.com.enonic.app.features.';

    function report(id, ok, detail) {
        var el = document.getElementById(id);
        if (!el) {
            return;
        }
        el.textContent = ok ? 'pass' : 'FAIL';
        el.className = ok ? 'ok' : 'blocked';
        var detailEl = document.getElementById('detail-' + id.replace(/^check-/, ''));
        if (detailEl) {
            detailEl.textContent = 'Got: ' + detail;
        }
    }

    function processorAttributes() {
        var island = document.getElementById('processor-attributes');
        if (!island) {
            return null;
        }
        try {
            return JSON.parse(island.textContent);
        } catch (e) {
            return null;
        }
    }

    function run() {
        var seen = processorAttributes();

        if (!seen) {
            report('check-processor-page', false, 'no processor data in the page, is the processor registered?');
            report('check-processor-part', false, 'no processor data in the page, is the processor registered?');
        } else {
            var page = seen[PREFIX + 'pageMessage'];
            var part = seen[PREFIX + 'partMessage'];
            report('check-processor-page', !!page, page ? JSON.stringify(page) : 'missing');
            report('check-processor-part', !!part, part ? JSON.stringify(part) : 'missing');
        }

        fetch(window.location.href, {credentials: 'same-origin'}).then(function (response) {
            var header = response.headers.get('X-Custom-Attributes');
            document.getElementById('header-custom-attributes').textContent = header
                ? JSON.stringify(JSON.parse(header), null, 2)
                : '(header missing)';

            if (!header) {
                report('check-filter', false, 'header missing, is the filter mapped?');
                return;
            }

            var fromFilter = JSON.parse(header);
            var missing = ['filterMessage', 'pageMessage', 'partMessage'].filter(function (name) {
                return !fromFilter[PREFIX + name];
            });
            report('check-filter', missing.length === 0, missing.length ? 'missing ' + missing.join(', ') : 'all three present');
        }).catch(function (e) {
            report('check-filter', false, 'fetch failed: ' + e);
            document.getElementById('header-custom-attributes').textContent = 'fetch failed: ' + e;
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }
})();
