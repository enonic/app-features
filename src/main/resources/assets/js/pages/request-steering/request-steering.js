(function () {
    function cookieState() {
        var match = document.cookie.match(/(?:^|; )variant=([^;]*)/);
        document.getElementById('cookie-state').textContent = match ? 'variant=' + match[1] : 'no variant cookie';
    }
    document.getElementById('cookie-set').addEventListener('click', function () {
        document.cookie = 'variant=b; path=/';
        cookieState();
    });
    document.getElementById('cookie-clear').addEventListener('click', function () {
        document.cookie = 'variant=; path=/; max-age=0';
        cookieState();
    });
    cookieState();
})();
