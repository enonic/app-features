(function () {
    var base = document.body.getAttribute('data-self-url') || window.location.pathname;
    var button = document.getElementById('verify');
    var state = document.getElementById('verify-state');
    var results = document.getElementById('verify-results');

    if (!button) {
        return;
    }

    button.addEventListener('click', function () {
        button.disabled = true;
        results.innerHTML = '';
        state.textContent = 'checking...';

        fetch(base + '?verify=json', {credentials: 'same-origin'})
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('the server answered ' + response.status);
                }
                return response.json();
            })
            .then(function (data) {
                state.textContent = data.summary;

                var table = document.createElement('table');
                data.results.forEach(function (result) {
                    var row = table.insertRow();
                    row.insertCell().textContent = result.name;
                    var verdict = row.insertCell();
                    verdict.textContent = result.verdict;
                    verdict.className = result.ok ? 'ok' : 'failed';
                    row.insertCell().textContent = result.detail;
                });
                results.appendChild(table);
                button.disabled = false;
            })
            .catch(function (e) {
                state.textContent = 'Check failed: ' + e;
                button.disabled = false;
            });
    });
})();
