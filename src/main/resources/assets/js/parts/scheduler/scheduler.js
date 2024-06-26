$(function () {

    $(document).on('click', 'button[name="createSchedule"]', function (e) {
        e.preventDefault();
        var $form = $('form#createSchedulerForm');

        sendAndRender($form.attr('action'), {
            operation: 'create',
            schedulerName: $form.find('input[name="schedulerName"]').val(),
            schedulerDescription: $form.find('input[name="schedulerDescription"]').val(),
            schedulerDescriptor: $form.find('input[name="schedulerDescriptor"]').val(),
            schedulerSchedule: $form.find('input[name="schedulerSchedule"]').val(),
            schedulerType: 'CRON'
        }, function (html) {
            $form[0].reset();
            $('.schedules__container').replaceWith(html);
        });
    });

    $(document).on('click', 'button[name="modifySchedule"]', function (e) {
        e.preventDefault();
        var $form = $('form#modifySchedulerForm');

        sendAndRender($form.attr('action'), {
            operation: 'modify',
            schedulerName: $form.find('input[name="schedulerName"]').val(),
            schedulerDescription: $form.find('input[name="schedulerDescription"]').val(),
            schedulerDescriptor: $form.find('input[name="schedulerDescriptor"]').val(),
            schedulerSchedule: $form.find('input[name="schedulerSchedule"]').val(),
            schedulerType: 'CRON'
        }, function (html) {
            $form[0].reset();
            $('.schedules__container').replaceWith(html);
        });
    });

    $(document).on('click', 'button[name="deleteSchedule"]', function (e) {
        e.preventDefault();
        var $form = $('form#deleteSchedulerForm');

        sendAndRender($form.attr('action'), {
            operation: 'delete',
            schedulerName: $form.find('input[name="schedulerName"]').val(),
        }, function (html) {
            $form[0].reset();
            $('.schedules__container').replaceWith(html);
        });
    });

    $(document).on('click', 'button[name="getSchedule"]', function (e) {
        e.preventDefault();
        var $form = $('form#getScheduleForm');

        sendAndRender($form.attr('action'), {
            operation: 'get',
            name: $form.find('input[name="name"]').val()
        }, function (json) {
            $('.schedule__get-by-name').val(JSON.stringify(json, undefined, 4));
        })
    });

    function sendAndRender(action, data, callbackFn) {
        $.ajax({
            url: action,
            method: "POST",
            contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
            data: data || {}
        }).done(callbackFn);
    }
});
