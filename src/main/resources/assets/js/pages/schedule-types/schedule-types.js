(function () {
    var postUrl = document.body.getAttribute('data-post-url') || window.location.href;
    var state = document.getElementById('op-state');

    function post(operation) {
        state.textContent = operation + '...';
        fetch(postUrl, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: 'operation=' + encodeURIComponent(operation)
        }).then(function (response) {
            return response.json();
        }).then(function (result) {
            if (result.error) {
                state.textContent = operation + ' refused: ' + result.error
                    + ' (managing jobs needs an administrator, log in to the XP admin first)';
                return;
            }
            state.textContent = operation + ' done, jobs: ' + (result.jobs.join(', ') || 'none');
            window.setTimeout(function () {
                window.location.reload();
            }, 400);
        }).catch(function (e) {
            state.textContent = operation + ' failed: ' + e;
        });
    }

    document.getElementById('job-one-time').addEventListener('click', function () {
        post('one-time');
    });
    document.getElementById('job-fixed-rate').addEventListener('click', function () {
        post('fixed-rate');
    });
    document.getElementById('job-slow').addEventListener('click', function () {
        post('slow');
    });
    document.getElementById('job-clear').addEventListener('click', function () {
        post('clear');
    });
    document.getElementById('reload').addEventListener('click', function () {
        window.location.reload();
    });
})();
