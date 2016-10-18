$(function () {

    $(document).on('click', 'form button[name="send"]', function (e) {
        e.preventDefault();
        var form = $(this).closest('form');

        $.ajax({
            url: form.attr('action'),
            method: "POST",
            contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
            data: {
                url: form.find('input[name="url"]').val(),
                method: form.find('input[name="method"]:checked').val(),
                contentType: form.find('select[name="contentType"]').val(),
                param1: form.find('input[name="param1"]').val(),
                param2: form.find('input[name="param2"]').val(),
                param3: form.find('input[name="param3"]').val(),
                param4: form.find('input[name="param4"]').val(),
                value1: form.find('input[name="value1"]').val(),
                value2: form.find('input[name="value2"]').val(),
                value3: form.find('input[name="value3"]').val(),
                value4: form.find('input[name="value4"]').val(),
                body: form.find('textarea[name="body"]').val(),
                connectTimeout: form.find('input[name="connectTimeout"]').val(),
                readTimeout: form.find('input[name="readTimeout"]').val(),

                headerName1: form.find('input[name="headerName1"]').val(),
                headerName2: form.find('input[name="headerName2"]').val(),
                headerName3: form.find('input[name="headerName3"]').val(),
                headerName4: form.find('input[name="headerName4"]').val(),
                headerValue1: form.find('input[name="headerValue1"]').val(),
                headerValue2: form.find('input[name="headerValue2"]').val(),
                headerValue3: form.find('input[name="headerValue3"]').val(),
                headerValue4: form.find('input[name="headerValue4"]').val(),

                proxyHost: form.find('input[name="proxyHost"]').val(),
                proxyPort: form.find('input[name="proxyPort"]').val(),
                proxyUsername: form.find('input[name="proxyUsername"]').val(),
                proxyPassword: form.find('input[name="proxyPassword"]').val(),
                authUsername: form.find('input[name="authUsername"]').val(),
                authPassword: form.find('input[name="authPassword"]').val(),
                debug: true
            }
        }).done(function (resp) {
            var html = $(resp);
            form.closest('.http-part').replaceWith(html);
        });
    });

});