$(function () {

    $(document).on('click', 'form button[name="logout"]', function (e) {
        e.preventDefault();
        var form = $(this).closest('form');

        $.ajax({
            url: form.attr('action'),
            method: "POST",
            contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
            data: {
                action: 'logout'
            }
        }).done(function (resp) {
            form.closest('.auth-part').replaceWith(resp);
        });
    });

    $(document).on('click', 'form button[name="login"]', function (e) {
        e.preventDefault();
        var form = $(this).closest('form');

        $.ajax({
            url: form.attr('action'),
            method: "POST",
            contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
            data: {
                action: 'login',
                user: form.find('input[name="user"]').val(),
                pwd: form.find('input[name="pwd"]').val(),
                userStore: form.find('input[name="userStore"]').val()
            }
        }).done(function (resp) {
            form.closest('.auth-part').replaceWith(resp);
        });
    });

});