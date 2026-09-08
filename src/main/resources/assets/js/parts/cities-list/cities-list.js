(function () {
    var select = document.getElementById('citiesSelect');

    if (!select) {
        return;
    }

    // An external script rather than an inline onchange handler: Content Studio's preview is served
    // through the admin endpoint, whose policy is script-src 'self', so an inline handler never runs
    // there and the select appeared to do nothing.
    select.addEventListener('change', function () {
        var url = select.options[select.selectedIndex].value;
        if (url) {
            window.location = url;
        }
    });
})();
