(function () {
    const statusEl = document.getElementById('sse-status');
    const urlEl = document.getElementById('sse-url');
    const radios = document.querySelectorAll('input[name="sse-source"]');
    if (!statusEl || !urlEl || radios.length === 0) {
        return;
    }

    let es = null;
    let completed = false;

    function connect(url) {
        if (es) {
            es.close();
        }
        completed = false;
        urlEl.textContent = url;
        statusEl.textContent = 'Connecting…';
        es = new EventSource(url);
        es.onmessage = function (e) {
            statusEl.textContent = e.data;
            if (e.data === 'Done!') {
                completed = true;
                es.close();
            }
        };
        es.onerror = function () {
            if (completed) {
                return;
            }
            statusEl.textContent = '(disconnected)';
        };
    }

    radios.forEach(function (r) {
        r.addEventListener('change', function () {
            if (r.checked) {
                connect(r.getAttribute('data-url'));
            }
        });
    });

    const checked = document.querySelector('input[name="sse-source"]:checked');
    if (checked) {
        connect(checked.getAttribute('data-url'));
    }
})();
