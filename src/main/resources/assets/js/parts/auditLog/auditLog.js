$(function () {

    $(document).on('click', 'button[name="createAuditLog"]', function (e) {
        e.preventDefault();
        var $form = $('form#createAuditLogForm');

        sendAndRender($form.attr('action'), {
            operation: 'log',
            type: $form.find('input[name="auditLogType"]').val(),
            time: $form.find('input[name="auditLogTime"]').val(),
            source: $form.find('input[name="auditLogSource"]').val(),
            user: $form.find('input[name="auditLogUser"]').val(),
            objects: $form.find('textarea[name="auditLogObjects"]').val(),
            data: $form.find('textarea[name="auditLogData"]').val()
        }, function (html) {
            $form[0].reset();
            $('.audit-logs__create-form').replaceWith(html);
        });
    });

    $(document).on('click', 'button[name="findAuditLog"]', function (e) {
        e.preventDefault();
        var $form = $('form#findAuditLogForm');
        findAuditLogs($form[0]);
    });

    $(document).on('click', 'button[name="resetFindAuditLog"]', function (e) {
        e.preventDefault();
        var $form = $('form#findAuditLogForm');
        $form[0].reset();
        findAuditLogs($form[0]);
    });

    $(document).on('click', 'button[name="getAuditLog"]', function (e) {
        e.preventDefault();
        var $form = $('form#getAuditLogForm');

        sendAndRender($form.attr('action'), {
            operation: 'get',
            id: $form.find('input[name="id"]').val()
        }, function (json) {
            $('.audit-logs__get-by-id').val(JSON.stringify(json, undefined, 4));
        })
    });

    function findAuditLogs(form) {
        var $form = $(form);
        sendAndRender($form.attr('action'), {
            operation: 'find',
            start: $form.find('input[name="start"]').val(),
            count: $form.find('input[name="count"]').val(),
            from: $form.find('input[name="from"]').val(),
            to: $form.find('input[name="to"]').val(),
            type: $form.find('input[name="type"]').val(),
            source: $form.find('input[name="source"]').val(),
            ids: $form.find('input[name="ids"]').val(),
            users: $form.find('input[name="users"]').val(),
            objects: $form.find('input[name="objects"]').val()
        }, function (html) {
            $('.audit-logs--container').replaceWith(html);
        });
    }

    function sendAndRender(action, data, callbackFn) {
        $.ajax({
            url: action,
            method: "POST",
            contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
            data: data || {}
        }).done(callbackFn);
    }

});
