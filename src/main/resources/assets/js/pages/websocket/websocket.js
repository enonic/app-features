(function () {
    const container = document.getElementById('ws-panels');
    if (!container) {
        return;
    }

    const defaultApiUrl = container.getAttribute('data-api-url');

    container.querySelectorAll('.ws-panel').forEach(function (panel) {
        const mode = panel.getAttribute('data-mode');
        const statusEl = panel.querySelector('.ws-status');
        const logEl = panel.querySelector('.ws-log');
        const sendBtn = panel.querySelector('.ws-send');
        const pingToggle = panel.querySelector('.ws-ping');
        let pingTimer = null;
        let opened = false;

        function log(text) {
            const item = document.createElement('li');
            item.textContent = new Date().toLocaleTimeString() + ' ' + text;
            logEl.appendChild(item);
            logEl.scrollTop = logEl.scrollHeight;
        }

        const url = new URL(panel.getAttribute('data-api-url') || defaultApiUrl);
        url.searchParams.set('mode', mode);
        const ws = new WebSocket(url.toString());

        ws.onopen = function () {
            opened = true;
            statusEl.textContent = 'open';
            statusEl.classList.add('open');
            sendBtn.disabled = false;
            if (pingToggle) {
                pingToggle.disabled = false;
            }
        };

        ws.onmessage = function (e) {
            log(e.data);
        };

        ws.onerror = function () {
            log('(error)');
        };

        ws.onclose = function (e) {
            const details = 'code ' + e.code + (e.reason ? ' "' + e.reason + '"' : '');
            if (opened) {
                statusEl.textContent = 'closed: ' + details;
            } else {
                statusEl.textContent = 'rejected — log in to connect';
            }
            statusEl.classList.remove('open');
            statusEl.classList.add(e.code === 1008 ? 'terminated' : 'closed');
            log((opened ? 'closed with ' : 'connection rejected, ') + details);
            sendBtn.disabled = true;
            if (pingTimer) {
                clearInterval(pingTimer);
                pingTimer = null;
            }
            if (pingToggle) {
                pingToggle.checked = false;
                pingToggle.disabled = true;
            }
        };

        sendBtn.addEventListener('click', function () {
            ws.send('hello from ' + mode);
        });

        if (pingToggle) {
            pingToggle.addEventListener('change', function () {
                if (pingToggle.checked) {
                    pingTimer = setInterval(function () {
                        ws.send('ping');
                    }, 5000);
                } else if (pingTimer) {
                    clearInterval(pingTimer);
                    pingTimer = null;
                }
            });
        }
    });

    const logoutBtn = document.getElementById('ws-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            logoutBtn.disabled = true;
            // The ID provider logout endpoint ends the session; fetch keeps the page (and its sockets) alive
            // so the close frames stay visible.
            fetch(logoutBtn.getAttribute('data-url')).then(function () {
                document.getElementById('ws-logout-result').textContent = 'Session ended — watch the sockets.';
            });
        });
    }
})();
