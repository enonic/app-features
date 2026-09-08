(function () {
    var base = document.body.getAttribute('data-self-url') || window.location.pathname;
    var taskButton = document.getElementById('run-task');
    var taskState = document.getElementById('task-state');
    var taskLog = document.getElementById('task-log');
    var inlineButton = document.getElementById('run-inline');
    var inlineState = document.getElementById('inline-state');
    var inlineResults = document.getElementById('inline-results');
    var timer = null;

    function appendLine(text) {
        var li = document.createElement('li');
        li.textContent = text;
        taskLog.appendChild(li);
    }

    function stopPolling() {
        window.clearInterval(timer);
        taskButton.disabled = false;
    }

    function poll(taskId) {
        fetch(base + '?taskId=' + encodeURIComponent(taskId), {
            credentials: 'same-origin'
        }).then(function (response) {
            return response.json();
        }).then(function (task) {
            if (task.error) {
                taskState.textContent = task.error;
                stopPolling();
                return;
            }

            taskState.textContent = task.state + ' ' + task.current + '/' + task.total;

            var line = task.current + '/' + task.total + ' ' + task.info;
            if (!taskLog.lastChild || taskLog.lastChild.textContent !== line) {
                appendLine(line);
            }

            if (task.state === 'FINISHED' || task.state === 'FAILED') {
                stopPolling();
            }
        }).catch(function (e) {
            taskState.textContent = 'Polling failed: ' + e;
            stopPolling();
        });
    }

    if (taskButton) {
        taskButton.addEventListener('click', function () {
        taskButton.disabled = true;
        taskLog.innerHTML = '';
        taskState.textContent = 'submitting...';

        fetch(base, {method: 'POST', credentials: 'same-origin'})
            .then(function (response) {
                return response.json();
            })
            .then(function (result) {
                if (result.error) {
                    taskState.textContent = 'Could not submit: ' + result.error;
                    taskButton.disabled = false;
                    return;
                }
                taskState.textContent = 'submitted ' + result.taskId;
                timer = window.setInterval(function () {
                    poll(result.taskId);
                }, 700);
            })
                .catch(function (e) {
                    taskState.textContent = 'Could not submit: ' + e;
                    taskButton.disabled = false;
                });
        });
    }

    if (inlineButton) {
        inlineButton.addEventListener('click', function () {
        inlineButton.disabled = true;
        inlineResults.innerHTML = '';
        inlineState.textContent = 'running...';

        fetch(base + '?results=json', {credentials: 'same-origin'})
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('the server answered ' + response.status);
                }
                return response.json();
            })
            .then(function (data) {
                inlineState.textContent = data.summary;

                data.results.forEach(function (result) {
                    var heading = document.createElement('h3');
                    var label = document.createElement('span');
                    label.textContent = result.label + ' ';
                    var verdict = document.createElement('span');
                    verdict.textContent = result.verdict;
                    verdict.className = result.ok ? 'ok' : 'failed';
                    heading.appendChild(label);
                    heading.appendChild(verdict);

                    var output = document.createElement('pre');
                    output.textContent = result.output;

                    inlineResults.appendChild(heading);
                    inlineResults.appendChild(output);
                });

                inlineButton.disabled = false;
            })
                .catch(function (e) {
                    inlineState.textContent = 'Run failed: ' + e;
                    inlineButton.disabled = false;
                });
        });
    }
})();
