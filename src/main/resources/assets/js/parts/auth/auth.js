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

    $(document).on('click', 'form button[name="getProfile"]', function (e) {
        e.preventDefault();
        var form = $(this).closest('form');
        postForm(form, 'getProfile');
    });

    $(document).on('click', 'form button[name="modifyProfile"]', function (e) {
        e.preventDefault();
        var form = $(this).closest('form');
        postForm(form, 'modifyProfile');
    });

    $(document).on('click', 'form button[name="findUsers"]', function (e) {
        e.preventDefault();
        var form = $(this).closest('form');
        postForm(form, 'findUsers');
    });

    $(document).on('click', 'form button[name="findPrincipals"]', function (e) {
        e.preventDefault();
        var form = $(this).closest('form');
        var fieldSet = $(this).closest('#auth-find-principal');
        postForm(form, 'findPrincipals', fieldSet);
    });

});

function postForm(form, action, fieldSet) {
    fieldSet = fieldSet || form;
    $.ajax({
        url: form.attr('action'),
        method: "POST",
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        data: {
            action: action,
            user: fieldSet.find('input[name="user"]').val(),
            pwd: fieldSet.find('input[name="pwd"]').val(),
            idProvider: fieldSet.find('input[name="idProvider"]').val(),
            role: fieldSet.find('input[name="role"]').val(),
            userKey: fieldSet.find('input[name="userKey"]').val(),
            scope: fieldSet.find('input[name="scope"]').val(),
            profile: fieldSet.find('textarea[name="profile"]').val(),
            start: fieldSet.find('input[name="start"]').val(),
            count: fieldSet.find('input[name="count"]').val(),
            query: fieldSet.find('input[name="query"]').val(),
            sort: fieldSet.find('input[name="sort"]').val(),
            includeProfile: fieldSet.find('input[name="includeProfile"]').is(':checked'),
            type: fieldSet.find('input[name="type"]').val(),
            name: fieldSet.find('input[name="name"]').val(),
            searchText: fieldSet.find('input[name="searchText"]').val()
        }
    }).done(function (resp) {
        form.closest('.auth-part').replaceWith(resp);
    });
}