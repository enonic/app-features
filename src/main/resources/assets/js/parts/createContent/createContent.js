$(function () {

    $(document).on('click', 'form button[name="create"]', function (e) {
        e.preventDefault();
        var form = $(this).closest('form');
        postForm(form);
    });

});

function postForm(form) {
    $.ajax({
        url: form.attr('action'),
        method: "POST",
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        data: {
            name: form.find('input[name="contentName"]').val(),
            displayName: form.find('input[name="displayName"]').val(),
            parent: form.find('input[name="parentPath"]').val(),
            contentType: form.find('input[name="contentType"]').val(),
            contentData: form.find('textarea[name="contentData"]').val(),
            contentXData: form.find('textarea[name="contentXData"]').val(),
        }
    }).done(function (resp) {
        form.closest('.create-content-part').replaceWith(resp);
    });
}