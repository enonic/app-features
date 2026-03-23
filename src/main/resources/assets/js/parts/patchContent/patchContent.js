$(function () {

    $(document).on('click', 'form button[name="patch"]', function (e) {
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
            key: form.find('input[name="key"]').val(),
            patchData: form.find('textarea[name="patchData"]').val(),
            branches: form.find('input[name="branches"]').val(),
            skipSync: form.find('input[name="skipSync"]').is(':checked') ? 'true' : 'false'
        }
    }).done(function (resp) {
        form.closest('.patch-content-part').replaceWith(resp);
    });
}
