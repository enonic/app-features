$(function () {

    $('form button[name="send"]').on('click', function (e) {
        e.preventDefault();
        var form = $(this).closest('form');

        $.ajax({
            url: form.attr('action'),
            method: "POST",
            contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
            data: {
                subject: form.find('input[name="subject"]').val(),
                from: form.find('input[name="from"]').val(),
                to: form.find('input[name="to"]').val(),
                cc: form.find('input[name="cc"]').val(),
                bcc: form.find('input[name="bcc"]').val(),
                replyTo: form.find('input[name="replyTo"]').val(),
                body: form.find('textarea[name="body"]').val()
            }
        }).done(function (resp) {
            console.log(resp);
        });
    });

});