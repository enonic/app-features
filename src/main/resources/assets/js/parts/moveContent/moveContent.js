$(function () {

    $(document).on('click', 'form button[name="move"]', function (e) {
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
            source: form.find('input[name="source"]').val(),
            target: form.find('input[name="target"]').val()
        }
    }).done(function (resp) {
        form.closest('.move-content-part').replaceWith(resp);
    });
}