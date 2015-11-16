$(function () {

    $('input[name="principalKey"]').focus();
    $(document).on('keypress', 'form input[name="principalKey"]', function (e) {
        if (e.which == 13) {
            e.preventDefault();
            var form = $(this).closest('form');
            postForm(form, 'search');
        }
    });

    $(document).on('click', 'a[data-principal]', function (e) {
        e.preventDefault();
        var key = $(this).data('principal');
        $('input[name="principalKey"]').val(key);
        var form = $(this).closest('form');
        postForm(form, 'search');
        return false;
    });

    $(document).on('click', 'form button[name="search"]', function (e) {
        e.preventDefault();
        var form = $(this).closest('form');
        postForm(form, 'search');
    });

    $(document).on('click', 'form button[name="remove"]', function (e) {
        e.preventDefault();
        var form = $(this).closest('form');
        postForm(form, 'remove');
    });

});

function postForm(form, action) {
    var keys = [];
    $('input[data-principal]:checked').each(function () {
        keys.push($(this).data('principal'))
    });

    var type = form.find('input[name="type"]:checked').val();
    $.ajax({
        url: form.attr('action'),
        method: "POST",
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        data: {
            action: action,
            key: form.find('input[name="principalKey"]').val(),
            username: form.find('input[name="username"]').val(),
            displayname: form.find('input[name="displayname"]').val(),
            email: form.find('input[name="email"]').val(),
            userstore: form.find('input[name="userstore"]').val(),
            user: type === 'user',
            group: type === 'group',
            role: type === 'role',
            remove: keys.join(','),
            debug: true
        }
    }).done(function (resp) {
        var html = $(resp);
        form.closest('.memberships-part').replaceWith(html);
        html.find('input[name="principalKey"]').focus();
    });
}