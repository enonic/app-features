$(function () {

    $(document).on('click', 'form button[name="moreKeys"]', function (e) {
        e.preventDefault();
        var p = $('<p>');
        var label = $('<label>').text('Content Key');
        var input = $('<input name="key" type="text" size="80"/>');
        p.append(label).append(' ').append(input);
        $(this).parent().append(p);

        input.focus();
        return false;
    });

    $(document).find('form input[name="key"]').focus();
    $(document).on('keypress', 'form input[name="key"]', function (e) {
        if (e.which == 13) {
            e.preventDefault();

            var form = $(this).closest('form');
            form.find('button[name="moreKeys"]').click();
        }
    });

    $(document).on('click', 'form button[name="unpublish"]', function (e) {
        e.preventDefault();
        var form = $(this).closest('form');
        form.find('span.unpublishresultmsg.success,span.unpublishresultmsg.fail').hide();

        var keys = form.find('input[name="key"]').map(function () {
            return $(this).val().trim();
        }).get();
        var keyParam = keys.filter(function (k) {
            return k !== ''
        }).join(',');

        $.ajax({
            url: form.attr('action'),
            method: "POST",
            contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
            data: {
                keys: keyParam,
                debug: true
            }
        }).done(function (resp) {
            var msg = resp.length + " items UNPUBLISHED. ";
            form.find('span.unpublishresultmsg.success').text(msg).show();
        }).fail(function (jqXHR, textStatus) {
            form.find('span.unpublishresultmsg.fail').text('Request failed.').show();
        });
    });

});