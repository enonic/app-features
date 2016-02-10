$(function () {

    var sourceHtml = CodeMirror.fromTextArea($(document).find('textarea[name="html"]').get(0), {
        lineNumbers: true,
        mode: "htmlmixed"
    });
    var cleanHtml = CodeMirror.fromTextArea($(document).find('textarea[name="cleanHtml"]').get(0), {
        lineNumbers: true,
        mode: "htmlmixed"
    });

    $(document).on('click', 'form button[name="sanitize"]', function (e) {
        e.preventDefault();
        var form = $(this).closest('form');

        $.ajax({
            url: form.attr('action'),
            method: "POST",
            contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
            data: {
                html: sourceHtml.getDoc().getValue(),
                debug: true
            }
        }).done(function (resp) {
            cleanHtml.getDoc().setValue(resp.sanitized);
        });
    });

});