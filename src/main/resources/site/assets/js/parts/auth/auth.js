$(function () {

    $(document).on('click', 'form button[name="logout"]', function (e) {
        e.preventDefault();
        var form = $(this).closest('form');
        postForm(form, 'logout');
    });

    $(document).on('click', 'form button[name="login"]', function (e) {
        e.preventDefault();
        var form = $(this).closest('form');
        postForm(form, 'login');
    });

    $(document).on('click', 'form button[name="hasRole"]', function (e) {
        e.preventDefault();
        var form = $(this).closest('form');
        postForm(form, 'hasRole');
    });

});

function postForm(form, action) {
    $.ajax({
        url: form.attr('action'),
        method: "POST",
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        data: {
            action: action,
            user: form.find('input[name="user"]').val(),
            pwd: form.find('input[name="pwd"]').val(),
            userStore: form.find('input[name="userStore"]').val(),
            role: form.find('input[name="role"]').val()
        }
    }).done(function (resp) {
        form.closest('.auth-part').replaceWith(resp);
    });
}