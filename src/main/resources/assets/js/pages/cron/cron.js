(function () {
    var body = document.body;
    var cronApiUrl = body.getAttribute('data-cron-api');
    var sseUrl = body.getAttribute('data-sse-url');
    var wsUrl = body.getAttribute('data-ws-url');

    var sseStatus = document.getElementById('sse-status');
    var sseLog = document.getElementById('sse-log');
    var wsStatus = document.getElementById('ws-status');
    var wsLog = document.getElementById('ws-log');
    var respBox = document.getElementById('cron-response');
    var delayInput = document.getElementById('cron-delay');

    function appendLog(list, text) {
        var li = document.createElement('li');
        li.textContent = text;
        list.insertBefore(li, list.firstChild);
        while (list.children.length > 20) {
            list.removeChild(list.lastChild);
        }
    }

    function callApi(operation) {
        var url = cronApiUrl + '?operation=' + encodeURIComponent(operation);
        var delay = delayInput ? delayInput.value : '';
        if (delay && (operation === 'schedule' || operation === 'reschedule')) {
            url += '&fixedDelay=' + encodeURIComponent(delay);
        }
        return fetch(url, {method: 'POST'}).then(function (r) { return r.json(); }).then(function (json) {
            respBox.textContent = JSON.stringify(json, null, 2);
            return json;
        });
    }

    document.getElementById('cron-schedule').addEventListener('click', function () { callApi('schedule'); });
    document.getElementById('cron-reschedule').addEventListener('click', function () { callApi('reschedule'); });
    document.getElementById('cron-unschedule').addEventListener('click', function () { callApi('unschedule'); });
    document.getElementById('cron-list').addEventListener('click', function () { callApi('list'); });
    document.getElementById('cron-get').addEventListener('click', function () { callApi('get'); });

    if (typeof EventSource !== 'undefined' && sseUrl) {
        sseStatus.textContent = 'Connecting SSE…';
        var es = new EventSource(sseUrl);
        es.addEventListener('connected', function (e) {
            sseStatus.textContent = 'SSE connected (' + e.data + ')';
        });
        es.addEventListener('tick', function (e) { appendLog(sseLog, e.data); });
        es.onerror = function () { sseStatus.textContent = 'SSE disconnected'; };
    }

    if (typeof WebSocket !== 'undefined' && wsUrl) {
        wsStatus.textContent = 'Connecting WS…';
        var proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        var absoluteWs = wsUrl.indexOf('http') === 0 ? wsUrl.replace(/^http/, 'ws') : proto + '//' + window.location.host + wsUrl;
        var ws = new WebSocket(absoluteWs);
        ws.onopen = function () { wsStatus.textContent = 'WS connected'; };
        ws.onmessage = function (e) { appendLog(wsLog, e.data); };
        ws.onclose = function () { wsStatus.textContent = 'WS disconnected'; };
    }
})();
